var express = require("express");
var router = express.Router();
var HttpStatus = require("http-status-codes");
var DB = require("./../../../../models/index");
var orderModel = DB.sequelize.models.order;
var moneyModel = DB.sequelize.models.money;
var regionalBranchModel = DB.sequelize.models.regionalBranch;
var subBranchModel = DB.sequelize.models.subBranch;
var branchUtils = require("./../../../../utils/branch");
var DataTableHelper = require("./../../../../utils/data_binder/dataTable");
var passport = require("passport");
var moment = require("moment-timezone");
var timezoneConfig = require("./../../../../config/timezone");
router.use(passport.authenticate("basic" , {session: false}));

var panicMiddleware = require("./../../../../middleware/panic");
router.use(panicMiddleware.blockIfPanicActivated);

router.get('/', function(req, res){

	tableHelper = new DataTableHelper(req.query);

	userObj = tableHelper.getUser();

	whereQuery = null;

  extraQuery = {

	};

	extraParamFilterQuery = tableHelper.getExtraFiltering();
	for(key in extraParamFilterQuery){
		extraQuery[key] = extraParamFilterQuery[key];
	}

	whereQuery = tableHelper.getWhere(extraQuery);

	queryParams  = {};
	queryParams["where"] = whereQuery;
	queryParams["order"] = tableHelper.getOrder() || "bar_code ASC";

	parcelOrderQuery = {
		model: orderModel,
		as: "vd_order",
		where:{
			status:{
				$ne:'draft'
			},
			type:{
				$eq: "value_delivery"
			}
		}
	};

	queryParams["include"] = [
		parcelOrderQuery
	];

	var aggregationQueryParams = Object.assign({} , queryParams);
	aggregationQueryParams["group"] = "uuid"

	queryParams["limit"] = tableHelper.getLimit();
	queryParams["offset"] = tableHelper.getOffset();

	var resultData = {};
	resultData["draw"] = tableHelper.getDraw();

	moneyModel
		.findAndCountAll(queryParams)
		.then(function(orderList){

				resultData["data"] = orderList;
				resultData["recordsTotal"] = orderList.count;
				resultData["recordsFiltered"] = orderList.count;

				return Promise.all(orderList.rows);
		})
		.map(function(moneyOrderData){

      if(moneyOrderData.dataValues.pay_time){
        moneyOrderData.dataValues.payment_time = moment.tz(moneyOrderData.dataValues.pay_time, timezoneConfig.COMMON_ZONE)
                                              .tz(timezoneConfig.CLIENT_ZONE)
                                              .format("YYYY-MM-DD HH:mm:ss");
      }

			if(moneyOrderData.dataValues.delivery_time){
				moneyOrderData.dataValues.delivery_time = moment.tz(moneyOrderData.dataValues.delivery_time, timezoneConfig.COMMON_ZONE)
                                              .tz(timezoneConfig.CLIENT_ZONE)
                                              .format("YYYY-MM-DD HH:mm:ss");
			}

      moneyOrderData.dataValues.createdAt = moment.tz(moneyOrderData.dataValues.createdAt, timezoneConfig.COMMON_ZONE)
																						.tz(timezoneConfig.CLIENT_ZONE)
																						.format("YYYY-MM-DD HH:mm:ss");

			return moneyOrderData;
		})
		.then(function(){

			return Promise.resolve(tableHelper.getAggregations());
		})
		.map(function(aggregation_obj){

			if(aggregation_obj.getOperation() == "sum"){

					return Promise.all([
						aggregation_obj ,
						moneyModel.sum(aggregation_obj.getColumn() , aggregationQueryParams)
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


module.exports = router;
