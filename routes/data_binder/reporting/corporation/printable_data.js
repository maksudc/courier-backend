var express = require("express");
var router = express.Router();
var HttpStatus = require("http-status-codes");
var DB = require("./../../../../models/index");
var orderModel = DB.sequelize.models.order;
var clientModel = DB.sequelize.models.client;
var corporationModel = DB.sequelize.models.corporation;
var itemModel = DB.sequelize.models.item;
var regionalBranchModel = DB.sequelize.models.regionalBranch;
var subBranchModel = DB.sequelize.models.subBranch;
var branchUtils = require("./../../../../utils/branch");
var DataTableHelper = require("./../../../../utils/data_binder/dataTable");
var passport = require("passport");
var moment = require("moment-timezone");
var timezoneConfig = require("./../../../../config/timezone");
var referrerLogic = require("./../../../../logics/referrer/referrerLogic");
var Promise = require("bluebird");

router.use(passport.authenticate("basic" , {session: false}));
router.get('/', function(req, res){

    var resultData = {};

    var queryParams = {};
    var whereQuery = {};

    var corporationId = getCorporationIdFromQueryString(req);
    var salesType = getSalesTypeFromQueryString(req);

    Promise.resolve({})
    .then(function(){

      return corporationModel.findOne({
        attributes: ["mobile", "name", "address", "status"],
        where: {
          id: corporationId
        }
      });
    })
    .then(function(corporation){

      resultData["corporation"] = corporation;
    })
    .then(function(){

      return clientModel.findAll({
        attributes:["mobile"],
        where:{
          corporationId: corporationId
        },
        order: [ [ "mobile", "ASC" ] ]
      });
    })
    .map(function(clientInstances){
      return Promise.resolve(clientInstances.dataValues.mobile);
    })
    .then(function(clientMobiles){

      whereQuery = getWhereQuery(req);

      clientRole = null;
      if(salesType == "booking_sale"){
        clientRole = "sender";
      }else{
        clientRole = "receiver";
      }

      whereQuery[clientRole] = {
        "$in": clientMobiles
      };

      queryParams["where"] = whereQuery;
      queryParams["order"] = req.query.order || "bar_code ASC";

      if(req.query.limit){
        queryParams["limit"] = req.query.limit;
      }
      if(req.query.offset){
        queryParams["offset"] = req.query.offset;
      }

      if(whereQuery){
        return orderModel.findAndCountAll(queryParams);
      }else{
        return Promise.resolve({ "count": 0, "rows": [] });
      }
    })
    .then(function(orderList){

				resultData["data"] = orderList;
				resultData["recordsTotal"] = orderList.count;
				resultData["recordsFiltered"] = orderList.count;

				return Promise.all(orderList.rows);
		})
		.map(function(orderData){
      if(orderData.dataValues.pay_time){
        orderData.dataValues.pay_time = moment.tz(orderData.dataValues.pay_time, timezoneConfig.COMMON_ZONE)
                                              .tz(timezoneConfig.CLIENT_ZONE)
                                              .format("YYYY-MM-DD HH:mm:ss");
      }
      orderData.dataValues.createdAt = moment.tz(orderData.dataValues.createdAt, timezoneConfig.COMMON_ZONE)
																						.tz(timezoneConfig.CLIENT_ZONE)
																						.format("YYYY-MM-DD HH:mm:ss");
      return orderData;
		})
    .map(function(orderData){

			return Promise.all([
				orderData,
				branchUtils.getInclusiveBranchInstance(orderData.entry_branch_type , orderData.entry_branch , null),
        branchUtils.getInclusiveBranchInstance(orderData.exit_branch_type , orderData.exit_branch , null),
        itemModel.count({ where: { orderUuid: orderData.dataValues.uuid } })
			]);
		})
		.map(function(complexResult){
			orderData = complexResult[0];
			aSourceBranchData = complexResult[1];
      adestinationBranchData = complexResult[2];
      itemCount = complexResult[3];

			orderData.dataValues.entry_label = branchUtils.prepareLabel(aSourceBranchData);
      orderData.dataValues.exit_label = branchUtils.prepareLabel(adestinationBranchData);
      orderData.dataValues.item_count = itemCount;
		})
		.then(function(){

			res.status(HttpStatus.OK);
			res.send(resultData);
		})
		.catch(function(err){
			if(err){
				console.error(err.stack);
			}
			res.status(HttpStatus.INTERNAL_SERVER_ERROR);
			res.send({ error:"Internal Server error occured" });
	});
});

function getWhereQuery(req){
    whereQuery = req.query.where || null;

    return whereQuery;
}

function getCorporationIdFromQueryString(req){
  if(req.query.extra && req.query.extra.external){
    return req.query.extra.external.corporationId;
  }
  return null;
}

function getSalesTypeFromQueryString(req){
  if(req.query.extra && req.query.extra.external){
    return req.query.extra.external.sales_type;
  }
  return null;
}

module.exports = router;
