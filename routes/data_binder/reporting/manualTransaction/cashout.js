var express = require("express");
var router = express.Router();

var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');
var HttpStatus = require("http-status-codes");
var adminUtils = require("./../../../../utils/admin");
var branchUtils = require("./../../../../utils/branch");
var orderLogic = require("./../../../../logics/orderLogic");
var DB = require("./../../../../models/index");
var manualTransactionModel = DB.sequelize.models.manualTransactions;
var regionalBranchModel = DB.sequelize.models.regionalBranch;
var subBranchModel = DB.sequelize.models.subBranch;
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
        "transaction_type": "cashout",
        "status": "received",
    };

	extraParamFilterQuery = tableHelper.getExtraFiltering();
	for(key in extraParamFilterQuery){
		extraQuery[key] = extraParamFilterQuery[key];
	}

	whereQuery = tableHelper.getWhere(extraQuery);

	extraJsonComplexQuery = tableHelper.getExtraComplexJsonFiltering();

	if(extraJsonComplexQuery){
		  combinedQuery = {
				"$and": []
			};
			combinedQuery["$and"].push(whereQuery);
			combinedQuery["$and"].push(extraJsonComplexQuery);
			whereQuery = combinedQuery;
	}

	queryParams  = {};
	queryParams["where"] = whereQuery;
	queryParams["order"] = tableHelper.getOrder() || "createdAt ASC";

	var aggregationQueryParams = Object.assign({} , queryParams);

	queryParams["limit"] = tableHelper.getLimit();
	queryParams["offset"] = tableHelper.getOffset();

	var resultData = {};
	resultData["draw"] = tableHelper.getDraw();

	manualTransactionModel
		.findAndCountAll(queryParams)
		.then(function(orderList){

				resultData["data"] = orderList;
				resultData["recordsTotal"] = orderList.count;
				resultData["recordsFiltered"] = orderList.count;

				return Promise.all(orderList.rows);
		})
		.map(function(orderData){
			orderData.dataValues.createdAt = moment.tz(orderData.dataValues.createdAt, timezoneConfig.COMMON_ZONE)
																						.tz(timezoneConfig.CLIENT_ZONE)
																						.format("YYYY-MM-DD HH:mm:ss");
      return orderData;
		})
		.map(function(orderData){

			return Promise.all([
				orderData,
				branchUtils.getInclusiveBranchInstance(orderData.branch_type , orderData.branch_id , null)
			]);
		})
		.map(function(complexResult){
			orderData = complexResult[0];
			aBranchData = complexResult[1];

			orderData.dataValues.target_branch = branchUtils.prepareLabel(aBranchData);
		})
		.then(function(){

			return Promise.resolve(tableHelper.getAggregations());
		})
		.map(function(aggregation_obj){

			if(aggregation_obj.getOperation() == "sum"){

					return Promise.all([
						aggregation_obj ,
						manualTransactionModel.sum(aggregation_obj.getColumn() , aggregationQueryParams)
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
