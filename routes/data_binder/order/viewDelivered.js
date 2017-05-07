var express = require("express");
var router = express.Router();

var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');
var HttpStatus = require("http-status-codes");
var adminUtils = require("./../../../utils/admin");
var branchUtils = require("./../../../utils/branch");
var orderLogic = require("./../../../logics/orderLogic");
var DB = require("./../../../models/index");
var orderModel = DB.sequelize.models.order;
var DataTableHelper = require("./../../../utils/data_binder/dataTable");

router.get('/', function(req, res){

	tableHelper = new DataTableHelper(req.query);
	// console.log(JSON.stringify(tableHelper.getWhere()));
	// console.log(tableHelper.getOrder());
	// console.log(tableHelper.getOffset());
	// console.log(tableHelper.getLimit());

	userObj = tableHelper.getUser();

	console.log(userObj);
	whereQuery = null;

  extraQuery = {
    "status": "delivered"
  };

	if(userObj){
		//&& !adminUtils.isPrivileged(userObj.getRole())){
		if(userObj.getSubBranchId()){
			extraQuery["exit_branch"] = userObj.getSubBranchId();
      extraQuery["exit_branch_type"] = branchUtils.desanitizeBranchType("sub");
		}
		else if(userObj.getRegionalBranchId()){
			extraQuery["exit_branch"] = userObj.getRegionalBranchId();
      extraQuery["exit_branch_type"] = branchUtils.desanitizeBranchType("regional");
		}
	}
  whereQuery = tableHelper.getWhere(extraQuery);

	queryParams  = {};
	queryParams["limit"] = tableHelper.getLimit();
	queryParams["offset"] = tableHelper.getOffset();
	queryParams["where"] = whereQuery;
	queryParams["order"] = tableHelper.getOrder() || "createdAt DESC";

	var resultData = {};
	resultData["draw"] = tableHelper.getDraw();

	orderModel
		.findAndCountAll(queryParams)
		.then(function(orderList){

				resultData["data"] = orderList;
				resultData["recordsTotal"] = orderList.count;
				resultData["recordsFiltered"] = orderList.count;

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
