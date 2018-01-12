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
var trackerLogModel = DB.sequelize.models.trackerLog;
var DataTableHelper = require("./../../../utils/data_binder/dataTable");
var panicUtils = require("./../../../utils/panic");

var moment = require("moment-timezone");
var TIMEZONE_CONFIG = require("./../../../config/timezone");

var passport = require("passport");

router.use(passport.authenticate('basic', {session: false}));

router.get('/:order_barcode', function(req, res){

	tableHelper = new DataTableHelper(req.query);

	userObj = tableHelper.getUser();

	whereQuery = null;

  var orderInstance = null;
	var trackerInstance = null;

	var resultData = {};
	resultData["draw"] = tableHelper.getDraw();

  orderModel
  .findOne({where : { bar_code: req.params.order_barcode  }})
  .then(function(orderObj){

    orderInstance = orderObj;
    return orderInstance.getTracker();
  })
  .then(function(trackerObj){

    trackerInstance = trackerObj;

		extraQuery = {
			"trackerId":{
				"$eq": trackerInstance.uuid
			}
		};
		whereQuery = tableHelper.getWhere(extraQuery);

		queryParams  = {};
		queryParams["limit"] = tableHelper.getLimit();
		queryParams["offset"] = tableHelper.getOffset();
		queryParams["where"] = whereQuery;
		queryParams["order"] = tableHelper.getOrder() || "createdAt ASC";

		return trackerLogModel.findAndCountAll(queryParams);
  })
	.then(function(logList){

			resultData["recordsTotal"] = logList.count;
			resultData["recordsFiltered"] = logList.rows.length;

			return Promise.resolve(logList.rows);
	})
	.map(function(logItem){

		return Promise.all([ logItem , branchUtils.getInclusiveBranchInstance(logItem.branchType , logItem.branchId) ]);
	})
	.then(function(results){

		resultData["data"] = [];
		for(I=0; I< results.length; I++){

			complexResult = results[I];
			logItem = complexResult[0];
			branchInstance = complexResult[1];

			currentData = {};
			currentData["action"] = logItem.action;

			currentData["branch"] = {};
			currentData["branch"]["type"] = logItem.branchType;
			currentData["branch"]["id"] = logItem.branchId;
			currentData["branch"]["label"] = branchUtils.prepareLabel(branchInstance);

			currentData["createdAt"] = moment.tz(logItem.createdAt , TIMEZONE_CONFIG.COMMON_ZONE).tz(TIMEZONE_CONFIG.CLIENT_ZONE).format("YYYY-MM-DD HH:mm:ss");

			resultData["data"].push(currentData);
		}
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
