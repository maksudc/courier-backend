var express = require("express");
var router = express.Router();

var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');
var HttpStatus = require("http-status-codes");
var adminUtils = require("./../../../utils/admin");
var moneyLogic = require("./../../../logics/moneyLogic");
var DB = require("./../../../models/index");
var moneyModel = DB.sequelize.models.money;
var DataTableHelper = require("./../../../utils/data_binder/dataTable");
var panicUtils = require("./../../../utils/panic");

router.get('/', function(req, res){

	tableHelper = new DataTableHelper(req.query);

	userObj = tableHelper.getUser();

	whereQuery = null;

	extraQuery = {
		//"status": "draft"
		"type": "general"
	};
	if(userObj){
		//&& !adminUtils.isPrivileged(userObj.getRole())){
		if(userObj.getSubBranchId()){
			extraQuery["source_sub_branch_id"] = userObj.getSubBranchId();
		}
		if(userObj.getRegionalBranchId()){
			extraQuery["source_regional_branch_id"] = userObj.getRegionalBranchId();
		}
	}
	if(panicUtils.isPanicked(req)){
		extraQuery = panicUtils.attachPanicQuery(extraQuery);
	}
	whereQuery = tableHelper.getWhere(extraQuery);

	queryParams  = {};
	queryParams["limit"] = tableHelper.getLimit();
	queryParams["offset"] = tableHelper.getOffset();
	queryParams["where"] = whereQuery;
	queryParams["order"] = tableHelper.getOrder();

	var resultData = {};
	resultData["draw"] = tableHelper.getDraw();

	moneyModel
		.findAndCountAll(queryParams)
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
