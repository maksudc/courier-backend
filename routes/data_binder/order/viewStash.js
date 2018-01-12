var express = require("express");
var router = express.Router();

var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');
var HttpStatus = require("http-status-codes");
var adminUtils = require("./../../../utils/admin");
var orderLogic = require("./../../../logics/orderLogic");
var DB = require("./../../../models/index");
var orderModel = DB.sequelize.models.order;
var DataTableHelper = require("./../../../utils/data_binder/dataTable");

router.get('/', function(req, res){

	tableHelper = new DataTableHelper(req.query);

	userObj = tableHelper.getUser();

	whereQuery = null;

  extraQuery = {
    "is_stash": true
  };

	if(userObj){
		//&& !adminUtils.isPrivileged(userObj.getRole())){
		if(userObj.getSubBranchId()){
			extraQuery["current_hub"] = userObj.getSubBranchId();
      extraQuery["current_hub_type"] = "sub";
		}
		else if(userObj.getRegionalBranchId()){
			extraQuery["current_hub"] = userObj.getRegionalBranchId();
      extraQuery["current_hub_type"] = "regional"
		}
	}
  whereQuery = tableHelper.getWhere(extraQuery);

	queryParams  = {};
	queryParams["limit"] = tableHelper.getLimit();
	queryParams["offset"] = tableHelper.getOffset();
	queryParams["where"] = whereQuery;
	queryParams["order"] = tableHelper.getOrder();

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
