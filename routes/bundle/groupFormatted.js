var express = require("express");
var router = express.Router();
var branchUtils = require("./../../utils/branch");
var DB = require("./../../models");
var sequelize = DB.sequelize;
var bundleModel = sequelize.models.bundle;
var HttpStatus = require("http-status-codes");
var Promise = require("bluebird");
var _ = require("underscore");

router.get("/:id" , function(req , res){

  var bundleInstance = null;
  var branchesDatas = null;
  var resultFormat = {};

  var entryBranchTypes = new Set();
  var entryBranchIds = new Set();
  var entryBranchMap = {};

  var exitBranchMap = {};
  var exitBranchIds = new Set();

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
    return branchUtils.getInclusiveBranchInstance(destBranch.branchType , destBranch.id);
  })
  .map(function(destBranchData){
    branchKey = destBranchData.branchType + "/" + destBranchData.id;
    exitBranchMap[branchKey] = destBranchData;
  })
  .then(function(){
    return bundleInstance.getAttachedItems({
      order: "bar_code ASC"
    });
  })
  .map(function(itemInstance){

    exitBranchKey = itemInstance.exit_branch_type + "/" + itemInstance.exit_branch;
    entryBranchKey = itemInstance.entry_branch_type + "/" + itemInstance.entry_branch;

    itemMap = {
      "order_bar_code": itemInstance.bar_code.split("-")[0],
      "bar_code": itemInstance.bar_code,
      "exitBranchKey": exitBranchKey,
      "entryBranchKey": entryBranchKey
    };

    return Promise.all([
      Promise.resolve(itemMap),
      branchUtils.getInclusiveBranchInstance(itemInstance.entry_branch_type , itemInstance.entry_branch)
    ]);
  })
  .map(function(resultList){
    itemMap = resultList[0];
    entryBranchInstance = resultList[1];

    exitBranchInstane = exitBranchMap[itemMap.exitBranchKey];

    // Cleansup unnecessary branch id reference to preserve bandwidth
    delete itemMap["exitBranchKey"];
    delete itemMap["entryBranchKey"];

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

    resultData = bundleInstance.dataValues;
    resultData.items = itemMaps;
    resultData.branches = branchesDatas;

    groupedItemMaps = _.groupBy(itemMaps , "exit_branch_label");
    for(dest in groupedItemMaps ){
      groupedItemMaps[dest] = _.groupBy(groupedItemMaps[dest] , "entry_branch_label");
      // Cleansup unnecessary entry and exit branch reference since they are already enclosed in the proper format
      for(source in groupedItemMaps[dest]){

        groupedItemMaps[dest][source] = _.sortBy(groupedItemMaps[dest][source] , function(iMap){
          orderCode = parseInt(iMap["order_bar_code"]);
          return orderCode;
        });

        groupedItemMaps[dest][source] = _.groupBy(groupedItemMaps[dest][source] , "order_bar_code");

        for(orderCode in groupedItemMaps[dest][source]){

          groupedItemMaps[dest][source][orderCode] = _.sortBy(groupedItemMaps[dest][source][orderCode]  , function(iMap){
            parts = iMap["bar_code"].split("-");
            icount = parseInt(parts[1]);
            return icount;
          });

          for(I=0 ; I< groupedItemMaps[dest][source][orderCode].length ; I++){

            delete groupedItemMaps[dest][source][orderCode][I]["exit_branch_label"];
            delete groupedItemMaps[dest][source][orderCode][I]["entry_branch_label"];
            delete groupedItemMaps[dest][source][orderCode][I]["order_bar_code"];
          }
        }

      }
    }

    resultData.items = groupedItemMaps;

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
