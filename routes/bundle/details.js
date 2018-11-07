var express = require("express");
var router = express.Router();
var branchUtils = require("./../../utils/branch");
var DB = require("./../../models");
var sequelize = DB.sequelize;
var bundleModel = sequelize.models.bundle;
var scanActivityModel = sequelize.models.scanActivity;
var HttpStatus = require("http-status-codes");
var Promise = require("bluebird");
var moment = require("moment-timezone");
var timezoneConfig = require("./../../config/timezone");
var _ = require("underscore");

router.get("/:id" , function(req , res){

  var bundleInstance = null;
  var branchesDatas = null;

  bundleModel
  .findOne({
    where: {
      id:{ "$eq": req.params.id }
    }
  })
  .then(function(bundleObj){
    bundleInstance = bundleObj;
    if(!bundleInstance){
      return Promise.reject("bundle does not exists");
    }
  })
  .then(function(){
    return bundleInstance.getDestinationSubBranches();
  })
  .map(function(destBranch){
    return destBranch.label;
  })
  .then(function(destBranchDatas){
    branchesDatas = destBranchDatas;
  })
  .then(function(){
    return bundleInstance.getAttachedItems({
      order: "updatedAt DESC"
    });
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
  // .map(function(itemMap){
  //
  //   return Promise.all([
  //     itemMap,
  //     scanActivityModel.max("createdAt",{
  //       where: {
  //         object_type: "item",
  //         object_id: itemMap["bar_code"],
  //         responseCode: 200,
  //         bundleId: bundleInstance.id
  //       },
  //       order: "createdAt DESC"
  //     })
  //   ]);
  // })
  // .map(function(complexResult){
  //
  //   itemMap = complexResult[0];
  //   lastSuccessfulScanningTimeInBundle = complexResult[1];
  //   itemMap["scanningTime"] = moment.tz(lastSuccessfulScanningTimeInBundle, timezoneConfig.COMMON_ZONE).tz(timezoneConfig.CLIENT_ZONE).format("YYYY-MM-DD HH:mm:ss");
  //   return Promise.resolve(itemMap);
  // })
  .then(function(itemMaps){

    resultData = bundleInstance.dataValues;
    resultData.items = itemMaps;
    resultData.branches = branchesDatas;

    res.status(HttpStatus.OK);
    res.send({
      status: "success",
      data: resultData
    });
  })
  .catch(function(err){
    if(err){
      console.error(err);
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR);
    res.send({ status:"error" , err: err });
  });
});

module.exports = router;
