var express = require("express");
var router = express.Router();

var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');
var HttpStatus = require("http-status-codes");
var DB = require("./../../../models/index");
var bundleModel = DB.sequelize.models.bundle;
var itemModel = DB.sequelize.models.item;

var adminUtils = require("./../../../utils/admin");
var branchUtils = require("./../../../utils/branch");

var DataTableHelper = require("./../../../utils/data_binder/dataTable");
var Promise = require("bluebird");
var panicUtils = require("./../../../utils/panic");

var bundleItemsRouteHandler = require("./items");
router.get("/:bundleId/items", bundleItemsRouteHandler);

router.get("/$" , function(req , res){

	tableHelper = new DataTableHelper(req.query);

	userObj = tableHelper.getUser();
  whereQuery = null;

	extraQuery = {

	};
	if(userObj){

    if(userObj.getSubBranchId()){
      extraQuery["createdAtBranchType"] = "sub";
			extraQuery["createdAtBranchId"] = userObj.getSubBranchId();
    }else{
      extraQuery["createdAtBranchType"] = "regional";
			extraQuery["createdAtBranchId"] = userObj.getRegionalBranchId();
    }
	}

	extraParamFilterQuery = tableHelper.getExtraFiltering();
	for(key in extraParamFilterQuery){
		extraQuery[key] = extraParamFilterQuery[key];
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

  bundleModel
		.findAndCountAll(queryParams)
		.then(function(bundleList){

				resultData["data"] = bundleList;
				resultData["recordsTotal"] = bundleList.count;
				resultData["recordsFiltered"] = bundleList.count;
        return bundleList.rows;
		})
    .map(function(bundleInstance){
      return Promise.all([
        bundleInstance ,
        bundleInstance.getDestinationSubBranches() ,
        itemModel.count({
          where:{
            bundleId: bundleInstance.id
          }
        })
      ]);
    })
    .map(function(complexArray){
      bundleInstance = complexArray[0];
      destinationBranches = complexArray[1];
      bundleInstance.dataValues.scannedItemCount = complexArray[2];

      bundleInstance.dataValues.destinations = [];
      for(I=0 ; I < destinationBranches.length ; I++){
        bundleInstance.dataValues.destinations.push(destinationBranches[I].label);
      }
      return  Promise.resolve(bundleInstance);
    })
    .then(function(bundleInstances){
      resultData["data"]["rows"] = bundleInstances;

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
