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
var printTrackerLogs = DB.sequelize.models.printTrackerLogs;
var DataTableHelper = require("./../../../utils/data_binder/dataTable");
var panicUtils = require("./../../../utils/panic");
const Op=DB.sequelize.op;
router.get('/', function(req, res){

	tableHelper = new DataTableHelper(req.query);

	userObj = tableHelper.getUser();

	whereQuery = null;

  extraQuery = {
    "print_type": "item",
	 "print_no":{
    	gt:1
	 }

  };

	if(panicUtils.isPanicked(req)){
		extraQuery = panicUtils.attachPanicQuery(extraQuery);
	}
  whereQuery = tableHelper.getWhere(extraQuery);

	queryParams  = {};
	queryParams["limit"] = tableHelper.getLimit();
	queryParams["offset"] = tableHelper.getOffset();
	queryParams["where"] = whereQuery;
	queryParams["order"] = tableHelper.getOrder() || "createdAt DESC";


	var resultData = {};
	resultData["draw"] = tableHelper.getDraw();

	printTrackerLogs
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
