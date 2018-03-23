var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var ShipmentModel = sequelize.models.shipment;
var RouteLogic = require("../logics/branchRouteLogic");
var genericTracker = sequelize.models.genericTracker;
var trackerLog = sequelize.models.trackerLog;
var moduleSettings = require("../config/moduleSettings");

var moment = require("moment");

genericTracker.hook("afterCreate" , function(trackerInstance , options , next){

  if(trackerInstance.trackableType == "orderItem" && !moduleSettings.ENABLE_ITEM_TRACKING){
    return next();
  }

  var trackerLogData = {};
  trackerLogData.action = "created";
  trackerLogData.trackerId = trackerInstance.uuid;
  trackerLogData.branchType = trackerInstance.sourceBranchType;
  trackerLogData.branchId = trackerInstance.sourceBranchId;

  var eventDateTime = moment.utc();
  trackerLogData.eventDateTime = eventDateTime;
  trackerLogData.createdAt = eventDateTime;
  trackerLogData.updatedAt = eventDateTime;

  return trackerLog
  .create(trackerLogData)
  .then(function(trackerLogItem){
    return next();
  })
  .catch(function(err){
    if(err){
        console.error(err.stack);
    }
    return next();
  });
});
/*
genericTracker.hook("beforeUpdate" , function(trackerInstance , options , next){

  if(trackerInstance.trackableType == "orderItem" && !moduleSettings.ENABLE_ITEM_TRACKING){
    return next();
  }

  var snapshotInstance = trackerInstance._previousDataValues;
  var updatedInstance = trackerInstance.dataValues;

  var trackerLogData = {};
  trackerLogData.trackerId = trackerInstance.uuid;

  trackerLogData.branchType = updatedInstance.currentBranchType;
  trackerLogData.branchId = updatedInstance.currentBranchId;

  var eventDateTime = moment.utc();
  trackerLogData.eventDateTime = eventDateTime;
  trackerLogData.createdAt = eventDateTime;
  trackerLogData.updatedAt = eventDateTime;

  if(snapshotInstance.currentBranchType != updatedInstance.currentBranchType || snapshotInstance.currentBranchId !=updatedInstance.currentBranchId){
    // current branch is changed , so most possible the tracked item has received in a branch
    // So the action will be `entrance`
    trackerLogData.action = "entrance";

    if(updatedInstance.currentBranchType == updatedInstance.destinationBranchType){
      if(updatedInstance.currentBranchId == updatedInstance.destinationBranchId){
        // the item is reached
        // So mark the tracker log as reached
        trackerLogData.action = "reached";
      }
    }
  }
  else if(snapshotInstance.nextBranchType != updatedInstance.nextBranchType || snapshotInstance.nextBranchId !=updatedInstance.nextBranchId){
    // next branch is changed
    // Most possibly the tracked item is marked as running
    // So the action will be `exit`
    trackerLogData.action = "exit";
  }

  if(trackerLogData.action){

    trackerLogData.createdAt = new Date();

    return trackerLog
    .create(trackerLogData)
    .then(function(trackerLogInstance){
      return next();
    });
  }else{

    return next();
  }
});
*/
