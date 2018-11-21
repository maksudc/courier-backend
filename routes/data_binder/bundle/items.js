var express = require("express");
var router = express.Router();

var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');
var HttpStatus = require("http-status-codes");

var DB = require("./../../../models/index");
var bundleModel = DB.sequelize.models.bundle;
var itemModel = DB.sequelize.models.item;

var DataTableHelper = require("./../../../utils/data_binder/dataTable");
var Promise = require("bluebird");
var panicUtils = require("./../../../utils/panic");
var branchUtils = require("./../../../utils/branch");

var moment = require("moment-timezone");
var timezoneConfig = require("./../../../config/timezone");
var _ = require("underscore");

var bundleItemsRouteHandler = function(req, res){

	tableHelper = new DataTableHelper(req.query);

	userObj = tableHelper.getUser();

	whereQuery = null;

  var bundleId = req.params.bundleId;

  extraQuery = {
		"bundleId":{
			"$eq": bundleId
		}
  };

	var barcodePattern = /^[0-9]+([\-][0-9]+)*/;
	if(tableHelper.config.search.value && !barcodePattern.test(tableHelper.config.search.value)){
		// whereQuery = 
	}else{
		whereQuery = tableHelper.getWhere(extraQuery);
	}

	queryParams  = {};
	queryParams["limit"] = tableHelper.getLimit();
	queryParams["offset"] = tableHelper.getOffset();
	queryParams["where"] = whereQuery;

  queryParams["order"] = tableHelper.getOrder() || "updatedAt DESC";

	var resultData = {};
	resultData["draw"] = tableHelper.getDraw();

  itemModel
    .findAndCountAll(queryParams)
		.then(function(itemList){

				resultData["data"] = itemList;
				resultData["recordsTotal"] = itemList.count;
				resultData["recordsFiltered"] = itemList.count;
        resultData["extra"] = {
          "bundleId": bundleId
        };

        return Promise.resolve(itemList.rows);
		})
    .map(function(itemInstance){

      itemParts = itemInstance.bar_code.split("-");

      scanningTime = "";
      if(itemInstance.get("last_scanned_at")){
        scanningTime = moment.tz(itemInstance.get("last_scanned_at"), timezoneConfig.COMMON_ZONE).tz(timezoneConfig.CLIENT_ZONE).format("YYYY-MM-DD HH:mm:ss");
      }

      itemMap = {
        "order_bar_code": parseInt(itemParts[0]),
        "bar_code": itemInstance.bar_code,
        "item_no": parseInt(itemParts[1]),
        "scanningTime": scanningTime
      };

      return Promise.all([
        Promise.resolve(itemMap),
        branchUtils.getInclusiveBranchInstance(itemInstance.entry_branch_type , itemInstance.entry_branch),
        branchUtils.getInclusiveBranchInstance(itemInstance.exit_branch_type , itemInstance.exit_branch)
      ]);
    })
    .map(function(resultList){

      itemMap = resultList[0];
      entryBranchInstance = resultList[1];
      exitBranchInstane = resultList[2];

      itemMap["entry_branch_label"] = entryBranchInstance.label;
      if(entryBranchInstance.regionalBranch){
        itemMap["entry_branch_label"] = itemMap["entry_branch_label"] + "," + entryBranchInstance.regionalBranch.label;
      }

      itemMap["exit_branch_label"] = exitBranchInstane.label;
      if(exitBranchInstane.regionalBranch){
        itemMap["exit_branch_label"] = itemMap["exit_branch_label"] + "," + exitBranchInstane.regionalBranch.label;
      }

      return Promise.resolve(itemMap);
    })
    .then(function(itemMaps){

      resultData["data"]["rows"] = getSortedItemMaps(itemMaps);

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

};

function getSortedItemMaps(itemMaps){

  sortedItemMaps = [];

  orderCodeSet = new Set();
  for(I=0; I < itemMaps.length; I++){
    orderCodeSet.add(parseInt(itemMaps[I].order_bar_code));
  }

  orderCodeArray = Array.from(orderCodeSet);
  orderCodeArray.sort(function(a,b){
    return a-b;
  });

  itemsSortedByOrderCode = _.sortBy(itemMaps, "order_bar_code");
  itemsGroupedByOrder = _.groupBy(itemsSortedByOrderCode, "order_bar_code");

  var sortedItemMaps = [];

  for(I=0; I < orderCodeArray.length; I++){

    orderCode = orderCodeArray[I];

    singleOrderSortedItems = _.sortBy(itemsGroupedByOrder[orderCode], function(itemDescriptor){
        item_code = itemDescriptor["bar_code"].split("-")[1];
        return parseInt(item_code);
    });

    sortedItemMaps = sortedItemMaps.concat(singleOrderSortedItems);
  }

  return sortedItemMaps;
}

module.exports = bundleItemsRouteHandler;
