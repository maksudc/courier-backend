var express = require("express");
var router = express.Router();

var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');
var HttpStatus = require("http-status-codes");
var adminUtils = require("./../../../../../utils/admin");
var branchUtils = require("./../../../../../utils/branch");
var orderLogic = require("./../../../../../logics/orderLogic");
var DB = require("./../../../../../models");
var orderModel = DB.sequelize.models.order;
var scanActivityModel = DB.sequelize.models.scanActivity;

var DataTableHelper = require("./../../../../../utils/data_binder/dataTable");
var panicUtils = require("./../../../../../utils/panic");

var moment = require("moment-timezone");
var TIMEZONE_CONFIG = require("./../../../../../config/timezone");

router.get('/:order_barcode', function(req, res){

	tableHelper = new DataTableHelper(req.query);

	userObj = req.user;

  whereQuery = null;
  extraQuery = {
		"object_id":{
			"$like": req.params.order_barcode + "-" + "%"
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

	resultData["data"] = [];

	scanActivityModel
		.findAndCountAll(queryParams)
		.then(function(scanActivityDatas){

				resultData["recordsTotal"] = scanActivityDatas.count;
				resultData["recordsFiltered"] = scanActivityDatas.count;

        return Promise.resolve(scanActivityDatas.rows);
		})
    .map(function(scanActivityInstance){

      return Promise.all([
        Promise.resolve(scanActivityInstance),
        scanActivityInstance.getBundle(),
				branchUtils.getInclusiveBranchInstance(scanActivityInstance.branch_type , scanActivityInstance.branch_id , null)
				//,scanActivityInstance.getObject(),
      ]);
    })
    .then(function(results){

      for(I=0; I < results.length ; I++){

				currentData = {};

        complexResult = results[I];

				scanActivityInstance = complexResult[0];
				bundleInstance = complexResult[1];
				branchInstance = complexResult[2];
				//objectInstance = complexResult[3];

				currentData["object_type"] = scanActivityInstance.object_type;
				currentData["object_id"] = scanActivityInstance.object_id;

				currentData["bundle"] = {};
				currentData["bundle"]["phase"] = bundleInstance.phase;
				currentData["bundle"]["id"] = bundleInstance.id;
				currentData["bundle"]["name"] = bundleInstance.name;

				currentData["branch"] = {};
				currentData["branch"]["type"] = branchInstance.branchType;
				currentData["branch"]["id"] = branchInstance.id;
				currentData["branch"]["label"] = branchUtils.prepareLabel(branchInstance);

				currentData["createdAt"] = moment.tz(scanActivityInstance.createdAt , TIMEZONE_CONFIG.COMMON_ZONE).tz(TIMEZONE_CONFIG.CLIENT_ZONE).format("YYYY-MM-DD HH:mm:ss");

				currentData["responseCode"] = scanActivityInstance.responseCode;
				currentData["operator"] = scanActivityInstance.operator;

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
