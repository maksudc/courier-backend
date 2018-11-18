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
  .then(function(itemMaps){

    resultData = bundleInstance.dataValues;
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
