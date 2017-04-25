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

	tableHelper = new DataTableHelper(req.query);
	console.log(JSON.stringify(tableHelper.getWhere()));
	console.log(tableHelper.getOrder());
	console.log(tableHelper.getOffset());
	console.log(tableHelper.getLimit());

	userObj = tableHelper.getUser();

	console.log(userObj);
	whereQuery = null;

	var vdOrderIds = [];

	orderExitBranchType = null;
	orderExitBranchId = null;

	if(userObj){
		if(userObj.getSubBranchId()){
			orderExitBranchType = branchUtils.desanitizeBranchType("sub");
			orderExitBranchId = userObj.getSubBranchId();
		}
		else if(userObj.getRegionalBranchId()){
			orderExitBranchType = branchUtils.desanitizeBranchType("regional");
			orderExitBranchId = userObj.getRegionalBranchId();
		}
	}

	vdOrderQuery = {
		"$and":[
			{ "type": { "$eq": "value_delivery" } },
			{ "status": { "$eq": "stocked" }  }
		]
	};
	if(orderExitBranchType){
		vdOrderQuery["$and"].push({ "exit_branch_type": { "$eq": orderExitBranchType } });
	}
	if(orderExitBranchId){
		vdOrderQuery["$and"].push({ "exit_branch": { "$eq": orderExitBranchId } });
	}

	orderModel
	.findAll({
		where: vdOrderQuery ,
		attributes: ["uuid"]
	})
	.map(function(vdOrderInstance){
		return vdOrderInstance["uuid"];
	})
	.then(function(datas){
		vdOrderIds = datas;
	})
	.then(function(){

		pureMoneyOrderQuery = {
			"$and":[
				{
					"type":{
						"$eq": "general"
					}
				},
				{
					"money_order_id":{
						"$eq": null
					}
				},
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

		vdMoneyOrderQuery = {
			"money_order_id":{
				"$in": vdOrderIds
			}
		};

		extraQuery = {
			"$or":[
				vdMoneyOrderQuery,
				pureMoneyOrderQuery
			]
		};

	  whereQuery = tableHelper.getWhere(extraQuery);

		queryParams  = {};
		queryParams["limit"] = tableHelper.getLimit();
		queryParams["offset"] = tableHelper.getOffset();
		queryParams["where"] = whereQuery;
		queryParams["order"] = tableHelper.getOrder();

		var resultData = {};
		resultData["draw"] = tableHelper.getDraw();

		return moneyModel
			.findAndCountAll(queryParams);
	})
	.then(function(moneyOrderList){

			resultData["data"] = moneyOrderList;
			resultData["recordsTotal"] = moneyOrderList.count;
			resultData["recordsFiltered"] = moneyOrderList.count;

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
