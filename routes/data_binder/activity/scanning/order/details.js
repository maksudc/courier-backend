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

router.get('/:order_barcode', function(req, res){

	tableHelper = new DataTableHelper(req.query);

	userObj = req.user;
  console.log(userObj);

  whereQuery = null;
  extraQuery = {
		"object_id":{
			"$like": req.params.order_barcode + "_" + "%"
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

	scanActivityModel
		.findAndCountAll(queryParams)
		.then(function(scanActivityDatas){

				resultData["data"] = scanActivityDatas;
				resultData["recordsTotal"] = scanActivityDatas.count;
				resultData["recordsFiltered"] = scanActivityDatas.count;

        return Promise.resolve(scanActivityDatas);

				res.status(HttpStatus.OK);
				res.send(resultData);
		})
    .map(function(scanActivityInstance){

      return Promise.all([
        Promise.resolve(scanActivityInstance),
        scanActivityInstance.getObject(),
        scanActivityInstance.getBundle(),
        scanActivityInstance.getBranch()
      ]);
    })
    .then(function(results){

      for(I=0; I < results.length ; I++){

        complexResult = results[0];
        scanActivityInstance = complexResult[0];
      }
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
