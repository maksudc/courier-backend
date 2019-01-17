var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer();
var DB = require("./../../models/index");
var bundleUtils = require('./../../utils/bundle');
var sequelize  = DB.sequelize;
var itemModel = sequelize.models.item;
var orderModel = sequelize.models.order;
var trackerLogModel = sequelize.models.trackerLog;
var genericTrackerModel = sequelize.models.genericTracker;
var bundleModel = sequelize.models.bundle;

var HttpStatus = require("http-status-codes");
var bodyParser = require('body-parser');

var branchUtils = require("./../../utils/branch");
var Promise = require("bluebird");
var passport = require("passport");

var adminActivityLogic = require("./../../logics/activity/admin");
var scanActivityLogic = require("./../../logics/activity/scan");

var moment = require("moment-timezone");
var timezoneConfig = require("./../../config/timezone");

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.use(passport.authenticate('basic', {session: false}));

router.post("/" , upload.array() , function(req , res){

  var itemBarCode = req.body.bar_code;
  var orderBarCode = itemBarCode.split("-")[0];
  var bundleId = req.body.bundleId;

  var bundleInstance = null;
  var itemInstance = null;
  var orderInstance = null;
  var orderTrackerInstance = null;
  var responseCode = null;
  var transactionErrorObj = null;

  sequelize.transaction(function(t){

    return bundleModel
    .findOne({
      where: {
        id: bundleId
      },
      transaction: t,
      lock: t.LOCK.SHARE
    })
    .then(function(bundleObj){
      bundleInstance = bundleObj;
    })
    .then(function(){
      return itemModel.findOne({
        where:{ bar_code: itemBarCode },
        transaction: t,
        lock: t.LOCK.UPDATE
      });
    })
    .then(function(itemobj){
      itemInstance = itemobj;
    })
    .then(function(){
      if(!bundleInstance){

        responseCode = HttpStatus.BAD_REQUEST;
        return Promise.reject({ code: responseCode ,  message: "Bundle does not exist" });
      }else if(!itemInstance){

        responseCode = HttpStatus.BAD_REQUEST;
        return Promise.reject({ code: responseCode ,  message: "Item Does not exist" });
      }else if(itemInstance.get("bundleId") == bundleInstance.get("id")){

        responseCode = HttpStatus.PRECONDITION_FAILED;
        return Promise.reject({ code: responseCode ,  message: "REPEAT", tag: "repeat" });
      }
    })
    .then(function(){

      return orderModel.findOne({
        where:{
          bar_code: orderBarCode
        },
        transaction: t,
        lock: t.LOCK.UPDATE
      });
    })
    .then(function(orderObj){

      orderInstance = orderObj;
      if(bundleUtils.isApplicableOrderForBundleProcessing(orderInstance.status)){
        responseCode = HttpStatus.LOCKED;
        return Promise.reject({ code: responseCode ,  message: "Item belonging to the order is locked" });
      }
    })
    .then(function(){

      return bundleInstance.getDestinationSubBranches({
        where: {
          id: itemInstance.exit_branch,
          branchType: itemInstance.exit_branch_type
        },
        transaction: t
      });
    })
    .then(function(checkBranchInstance){

      if(!checkBranchInstance || !checkBranchInstance.length){
        responseCode = HttpStatus.BAD_REQUEST;
        return Promise.reject({ code: responseCode , message: "This item does not belong to bundle"  });
      }
    })
    .then(function(){

      itemInstance.set("bundleId", bundleInstance.get("id"));

      if(bundleInstance.phase == "load"){
        // Leaving the branch
        itemInstance.set("status", "running");
      }else if(bundleInstance.phase == "unload"){
        // Entering into the branch
        itemInstance.set("status", "received");
      }

      itemInstance.set("current_hub", bundleInstance.createdAtBranchId);
      itemInstance.set("current_hub_type", bundleInstance.createdAtBranchType);

      scanningTime = moment.tz(timezoneConfig.COMMON_ZONE);
      itemInstance.set("last_scanned_at", scanningTime);

      return itemInstance.save({
        transaction: t
      });
    })
    .then(function(result){
      return branchUtils.getInclusiveBranchInstance(itemInstance.entry_branch_type , itemInstance.entry_branch);
    })
    .then(function(entrybranchInstance){
      itemInstance.entryBranch = entrybranchInstance;
    })
    .then(function(){
      return branchUtils.getInclusiveBranchInstance(itemInstance.exit_branch_type , itemInstance.exit_branch);
    })
    .then(function(exitBranchInstance){
      itemInstance.exitBranch = exitBranchInstance;
    })
    .then(function(){

      itemData = {};
      itemData["bar_code"] = itemInstance.bar_code;
      itemData["scanningTime"] = moment.tz(itemInstance.get("last_scanned_at"), timezoneConfig.COMMON_ZONE).tz(timezoneConfig.CLIENT_ZONE).format("YYYY-MM-DD HH:mm:ss");
      itemData["entry_branch_label"] = itemInstance.entryBranch.label;
      if(itemInstance.entryBranch.regionalBranch){
        itemData["entry_branch_label"] = itemData["entry_branch_label"] + ","+ itemInstance.entryBranch.regionalBranch.label;
      }
      itemData["exit_branch_label"] = itemInstance.exitBranch.label;
      if(itemInstance.exitBranch.regionalBranch){
        itemData["exit_branch_label"] = itemData["exit_branch_label"] + "," + itemInstance.exitBranch.regionalBranch.label;
      }
    })
    .then(function(){

      return orderInstance.getTracker({
        transaction: t,
        lock: t.LOCK.SHARE
      });
    })
    .then(function(orderTrackerObj){
      orderTrackerInstance = orderTrackerObj;

      if(["stocked", "delivered"].indexOf(orderInstance.status) > -1){

      }else{

        action = null;
        if(bundleInstance.phase == "load"){
          action = "exit";
        }else if(bundleInstance.phase == "unload"){
          action = "entrance";
        }

        return trackerLogModel.findOrCreate({
          where:{
            trackerId: orderTrackerInstance.uuid,
            branchType: itemInstance.current_hub_type,
            branchId: itemInstance.current_hub,
            action: action
          },
          defaults:{
            trackerId: orderTrackerInstance.uuid,
            branchType: itemInstance.current_hub_type,
            branchId: itemInstance.current_hub,
            action: action,
            eventDateTime: moment.tz(timezoneConfig.COMMON_ZONE).format('YYYY-MM-DD HH:mm:ss')
          }
        });
      }
    })
    .then(function(orderTrackLogCheckComplexResult){

      if(orderTrackLogCheckComplexResult){

        orderTrackLogInstance = orderTrackLogCheckComplexResult[0];
        trackerLogNewlyCreated = orderTrackLogCheckComplexResult[1];

        isBranchActivityAlreadyDone = !trackerLogNewlyCreated;

        if(isBranchActivityAlreadyDone){
          return Promise.resolve(orderTrackLogInstance);
        }

        orderInstance.set("current_hub", itemInstance.current_hub);
        orderInstance.set("current_hub_type", itemInstance.current_hub_type);

        if(itemInstance.current_hub_type == branchUtils.sanitizeBranchType(orderInstance.exit_branch_type) && itemInstance.current_hub == orderInstance.exit_branch){
          orderInstance.set("status", "stocked");
        }else{
          orderInstance.set("status", "received");
        }

        return orderInstance.save({
          transaction: t
        });
      }
    });
  })
  .then(function(result){
    responseCode = HttpStatus.OK;
  })
  .catch(function(err){
    if(err && err.code){
      responseCode = err.code;
    }else{
      responseCode = HttpStatus.INTERNAL_SERVER_ERROR;
    }
    transactionErrorObj = err;
  })
  .then(function(){

    scanParams = {};
    scanParams["object_type"] = "item";
    scanParams["object_id"] = itemBarCode;
    scanParams["bundleId"] = bundleId;
    scanParams["responseCode"] = responseCode;

    return scanActivityLogic.addScanActivity(req.user , scanParams , {} , null );
  })
  .then(function(obj){

    adminActivityParams = {};
    adminActivityParams["object_type"] = "item";
    adminActivityParams["object_id"] = itemBarCode;

    return adminActivityLogic.addAdminActivity(req.user , "scan" , adminActivityParams , {} , null);
  })
  .then(function(){
    if(responseCode != HttpStatus.OK){
      return Promise.reject(transactionErrorObj);
    }
  })
  .then(function(){

    res.status(responseCode);
    res.send({ "status":"success" , "item": itemData, "responseCode": responseCode });
  })
  .catch(function(err){

    if(err){
      console.error(err);
    }
    if(err && err.code){
      res.status(err.code);
    }else{
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
    }
    res.send({ status: "error" , error: err });
  });
});

module.exports = router;
