var express = require("express");
var router = express.Router();
var HttpStatus = require("http-status-codes");
var DB = require("./../../../../models/index");
var orderModel = DB.sequelize.models.order;
var regionalBranchModel = DB.sequelize.models.regionalBranch;
var subBranchModel = DB.sequelize.models.subBranch;
var clientModel = DB.sequelize.models.client;
var corporationModel = DB.sequelize.models.corporation;
var branchUtils = require("./../../../../utils/branch");
var DataTableHelper = require("./../../../../utils/data_binder/dataTable");
var passport = require("passport");
var moment = require("moment-timezone");
var timezoneConfig = require("./../../../../config/timezone");
var referrerLogic = require("./../../../../logics/referrer/referrerLogic");
var Promise = require("bluebird");

router.use(passport.authenticate("basic" , {session: false}));

var panicMiddleware = require("./../../../../middleware/panic");
router.use(panicMiddleware.blockIfPanicActivated);

router.get('/', function(req, res){

  	var tableHelper = new DataTableHelper(req.query);
  	var userObj = tableHelper.getUser();
  	var whereQuery = null;
    var extraQuery = {};
    var resultData = {};
    var aggregationQueryParams = {};

    var corporationId = getCorporationIdFromQueryString(req);
    var salesType = getSalesTypeFromQueryString(req);

    if(!corporationId || !salesType){
      res.status(HttpStatus.BAD_REQUEST);
      res.send({
        message: "corporationId or salesType missing"
      });
      return null;
    }

  	extraParamFilterQuery = tableHelper.getExtraFiltering();
  	for(key in extraParamFilterQuery){
  		extraQuery[key] = extraParamFilterQuery[key];
  	}

    clientModel.findAll({
      attributes:["mobile"],
      where:{
        corporationId: corporationId
      },
      order: [ [ "mobile", "ASC" ] ]
    })
    .map(function(clientInstances){
      return Promise.resolve(clientInstances.dataValues.mobile);
    })
    .then(function(clientMobiles){

      clientRole = null;
      if(salesType == "booking_sale"){
        clientRole = "sender";
      }else{
        clientRole = "receiver";
      }

      extraQuery[clientRole] = {
        "$in": clientMobiles
      };
    })
    .then(function(){

      whereQuery = tableHelper.getWhere(extraQuery);

      queryParams  = {};
      queryParams["where"] = whereQuery;
      queryParams["order"] = tableHelper.getOrder() || "bar_code ASC";

      aggregationQueryParams = Object.assign({} , queryParams);

      queryParams["limit"] = tableHelper.getLimit();
      queryParams["offset"] = tableHelper.getOffset();

      resultData["draw"] = tableHelper.getDraw();

      return orderModel.findAndCountAll(queryParams);
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
				branchUtils.getInclusiveBranchInstance(orderData.payment_hub_type , orderData.payment_hub , null)
			]);
		})
		.map(function(complexResult){
			orderData = complexResult[0];
			aBranchData = complexResult[1];

			orderData.dataValues.payment_branch = branchUtils.prepareLabel(aBranchData);
		})
		.then(function(){

			return Promise.resolve(tableHelper.getAggregations());
		})
		.map(function(aggregation_obj){

			if(aggregation_obj.getOperation() == "sum"){

					return Promise.all([
						aggregation_obj ,
						orderModel.sum(aggregation_obj.getColumn() , aggregationQueryParams)
					]);
			}
			return Promise.resolve(null);
		})
		.map(function(complexResult){

			if(!complexResult){
				return Promise.resolve(null);
			}
			aggregation_obj = complexResult[0];
			aggregation_result = complexResult[1];

			resultData["data"][aggregation_obj.getQueryField()] = aggregation_result;
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
