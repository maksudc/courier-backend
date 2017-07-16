var express = require("express");
var router = express.Router();

var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');
var HttpStatus = require("http-status-codes");
var adminUtils = require("./../../../utils/admin");
var branchUtils = require("./../../../utils/branch");
var moneyLogic = require("./../../../logics/moneyLogic");
var DB = require("./../../../models/index");
var orderModel = DB.sequelize.models.order;
var moneyModel = DB.sequelize.models.money;
var DataTableHelper = require("./../../../utils/data_binder/dataTable");

router.get('/', function(req, res){

	var resultData = {};

	var tableHelper = new DataTableHelper(req.query);

	userObj = tableHelper.getUser();

	console.log(userObj);
	whereQuery = null;

		pureMoneyOrderQuery = {
			"$and":[
				{
					"status": {
						"$eq": "deliverable"
					}
				}
			]
		};

		if(userObj){
			if(userObj.getSubBranchId()){
				pureMoneyOrderQuery["$and"].push({ "sub_branch_id": { "$eq": userObj.getSubBranchId() } });
			}
			if(userObj.getRegionalBranchId()){
				pureMoneyOrderQuery["$and"].push({ "regional_branch_id": { "$eq": userObj.getRegionalBranchId() } });
			}
		}

		extraQuery = pureMoneyOrderQuery;

	  whereQuery = tableHelper.getWhere(extraQuery);

		queryParams  = {};
		queryParams["where"] = whereQuery;
		queryParams["order"] = tableHelper.getOrder();

		var resultData = {};
		resultData["draw"] = tableHelper.getDraw();

		var baseQueryParams = queryParams;

		queryParams["limit"] = tableHelper.getLimit();
		queryParams["offset"] = tableHelper.getOffset();

		return moneyModel
			.findAndCountAll(queryParams)
			.then(function(moneyOrderList){

						resultData["data"] = moneyOrderList;
						resultData["recordsTotal"] = moneyOrderList.count;
						resultData["recordsFiltered"] = moneyOrderList.count;
				})
				.then(function(){

					return Promise.resolve(tableHelper.getAggregations());
				})
				.map(function(aggregation_obj){

					if(aggregation_obj.getOperation() == "sum"){

							return Promise.all([
								aggregation_obj ,
								moneyModel.sum(aggregation_obj.getColumn() , baseQueryParams)
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
				.then(function(complexResult){

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
