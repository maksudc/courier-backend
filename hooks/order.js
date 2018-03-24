var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var genericTracker = sequelize.models.genericTracker;
var order = sequelize.models.order;
var money = sequelize.models.money;
var item = sequelize.models.item;
var trackerLog = sequelize.models.trackerLog;

var subBranch = sequelize.models.subBranch;
var regionalBranch = sequelize.models.regionalBranch;

var itemLogic = require("../logics/itemLogic");
var orderLogic = require("../logics/orderLogic");
var RouteLogic = require("../logics/branchRouteLogic");

var handlebars = require("handlebars");
var fs = require("fs");
var messageUtils = require("../utils/message");
var Promise = require("bluebird");

var _ = require("lodash");
var moment = require("moment");

var branchUtils = require("../utils/branch");

function sanitizeBranchType(branchType){

  parts = [];

  if(branchType){
    parts = branchType.split("-");
  }

  if(parts.length > 0){
    return parts[0];
  }

  return ;
}

order.hook("beforeCreate" , function(instance , options , next){

  if(!instance.current_hub){
    instance.dataValues.current_hub = instance.entry_branch;
    instance.current_hub = instance.entry_branch;
  }
  if(!instance.current_hub_type){
    instance.dataValues.current_hub_type = sanitizeBranchType(instance.entry_branch_type);
    instance.current_hub_type = sanitizeBranchType(instance.entry_branch_type);
  }

  _.assignIn(instance._changed , { current_hub: true });
  _.assignIn(instance._changed , { current_hub_type: true });

  return next();
});

order.hook("afterCreate" , function(order , options){
  /**
    * Create a tracker item corresponding to the order
  **/
    var trackerData = {};

    trackerData.sourceBranchType = branchUtils.sanitizeBranchType(order.entry_branch_type);
    trackerData.sourceBranchId = parseInt(order.entry_branch);

    trackerData.destinationBranchType = branchUtils.sanitizeBranchType(order.exit_branch_type);
    trackerData.destinationBranchId = parseInt(order.exit_branch);

    trackerData.currentBranchType = trackerData.sourceBranchType;
    trackerData.currentBranchId = trackerData.sourceBranchId;

    trackerData.previousBranchType = trackerData.sourceBranchType;
    trackerData.previousBranchId = trackerData.sourceBranchId;

    trackerData.trackableType = "order";
    trackerData.trackableId = order.uuid;

    return sequelize.models.genericTracker
    .create(trackerData, {
      transaction: options.transaction
    });
});

order.hook("beforeUpdate" , function(instance , options){

  var updatedInstance = instance.dataValues;
  var snapshotInstance = instance._previousDataValues;

  console.log("Order Updated : " + snapshotInstance.bar_code + " Snapshot Status:  " + snapshotInstance.status + " Instance status: " + updatedInstance.status);

  if(instance.changed('status')){

    if(snapshotInstance.status == "ready" || snapshotInstance.status == "confirmed"){
      // can be switched to running
      if(updatedInstance.status == "running"){

        return instance.getTracker({
          transaction: options.transaction
        })
        .then(function(trackerInstance){
          trackerInstance.set("currentBranchType", branchUtils.sanitizeBranchType(updatedInstance.current_hub_type));
          trackerInstance.set("currentBranchId", parseInt(updatedInstance.current_hub));

          return trackerInstance.save({
            transaction: options.transaction
          });
        })
        .then(function(trackerInstance){

          trackerLogData = {};
          trackerLogData.action = "exit";
          trackerLogData.trackerId = trackerInstance.uuid;
          trackerLogData.branchType = trackerInstance.currentBranchType;
          trackerLogData.branchId = trackerInstance.currentBranchId;

          eventDateTime = moment.utc();
          trackerLogData.eventDateTime = eventDateTime;
          trackerLogData.createdAt = eventDateTime;
          trackerLogData.updatedAt = eventDateTime;

          return trackerLog
          .create(trackerLogData, {
            transaction: options.transaction
          });
        });
      }
    }
    else if(snapshotInstance.status == "running"){
      if(updatedInstance.status == 'received'){

        instance.dataValues = updatedInstance;
        if(updatedInstance.current_hub_type == sanitizeBranchType(updatedInstance.exit_branch_type) && updatedInstance.current_hub == updatedInstance.exit_branch){
          updatedInstance.status = "stocked";
        }

        return instance.getTracker({
          transaction: options.transaction
        })
        .then(function(trackerInstance){
          trackerInstance.set("currentBranchType", branchUtils.sanitizeBranchType(updatedInstance.current_hub_type));
          trackerInstance.set("currentBranchId", parseInt(updatedInstance.current_hub));

          return trackerInstance.save({
            transaction: options.transaction
          });
        })
        .then(function(trackerInstance){

          trackerLogData = {};
          trackerLogData.action = "entrance";
          trackerLogData.trackerId = trackerInstance.uuid;
          trackerLogData.branchType = trackerInstance.currentBranchType;
          trackerLogData.branchId = trackerInstance.currentBranchId;

          eventDateTime = moment.utc();
          trackerLogData.eventDateTime = eventDateTime;
          trackerLogData.createdAt = eventDateTime;
          trackerLogData.updatedAt = eventDateTime;

          return trackerLog
          .create(trackerLogData, {
            transaction: options.transaction
          });
        });
      }
    }
    else if(snapshotInstance.status == "received"){
      if(updatedInstance.status == 'running'){

        return instance.getTracker({
          transaction: options.transaction
        })
        .then(function(trackerInstance){
          trackerInstance.set("currentBranchType", branchUtils.sanitizeBranchType(updatedInstance.current_hub_type));
          trackerInstance.set("currentBranchId", parseInt(updatedInstance.current_hub));

          return trackerInstance.save({
            transaction: options.transaction
          });
        })
        .then(function(trackerInstance){

          trackerLogData = {};
          trackerLogData.action = "exit";
          trackerLogData.trackerId = trackerInstance.uuid;
          trackerLogData.branchType = trackerInstance.currentBranchType;
          trackerLogData.branchId = trackerInstance.currentBranchId;

          eventDateTime = moment.utc();
          trackerLogData.eventDateTime = eventDateTime;
          trackerLogData.createdAt = eventDateTime;
          trackerLogData.updatedAt = eventDateTime;

          return trackerLog
          .create(trackerLogData, {
            transaction: options.transaction
          });
        });
      }
    }
    else if(snapshotInstance.status == 'stocked'){
      if(updatedInstance.status == "delivered"){

      }else{
        updatedInstance.status = snapshotInstance.status;
      }
    }
  }

  instance.dataValues = updatedInstance;

  _.assignIn(instance._changed , { status: true });
  _.assignIn(instance._changed , { current_hub: true });
  _.assignIn(instance._changed , { current_hub_type: true });

  return Promise.resolve(instance);
});

order.hook("afterUpdate" , function(instance , options , next){

  var snapshotInstance = instance._previousDataValues;
  var updatedInstance = instance.dataValues;

  var orderInstance = instance;

  console.log(" on order after update hook for: "+ orderInstance.bar_code);

  var pstatus = Promise.resolve({});

  if(instance.changed('status')){

    if(updatedInstance.status == 'stocked'){

      pstatus = branchUtils
      .getInclusiveBranchInstance(updatedInstance.exit_branch_type , updatedInstance.exit_branch , null)
      .then(function(branchInstance){

        messageBranchInstance = branchInstance;

        // Send message to the receiver about stocking of his/her order
        // If the order corresponds to VD , the verification code should be for the corresponding money order instead of the
        // order object
        if(updatedInstance.type == "value_delivery"){

          instance
          .getMoney_order()
          .then(function(moneyOrderItem){

            if(moneyOrderItem){

              updatedInstance.sender_verification_code = moneyOrderItem.sender_verification_code;

              content = fs.readFileSync("./views/message/stocked.handlebars");
              contentTemplate = handlebars.compile(content.toString());
              messsageBody = contentTemplate({ parcelInstance: updatedInstance , branchInstance: messageBranchInstance });

              messageUtils.sendMessage(updatedInstance.receiver , messsageBody , function(data){
                console.log(data);
              });
            }
          });
        }else{

          content = fs.readFileSync("./views/message/stocked.handlebars");
          contentTemplate = handlebars.compile(content.toString());
          messsageBody = contentTemplate({ parcelInstance: updatedInstance , branchInstance: messageBranchInstance });

          messageUtils.sendMessage(updatedInstance.receiver , messsageBody , function(data){
            console.log(data);
          });
        }
      });

    }
    else if(updatedInstance.status == "delivered"){

      // Insert into tracker logs for final delivery of the order
      pstatus = instance
      .getTracker({
        transaction: options.transaction
      })
      .then(function(trackerInstance){

        var trackerLogData = {};

        trackerLogData.action = "delivered";
        trackerLogData.trackerId = trackerInstance.uuid;
        trackerLogData.branchType = trackerInstance.currentBranchType;
        trackerLogData.branchId = trackerInstance.currentBranchId;

        var eventDateTime = moment.utc();
        trackerLogData.eventDateTime = eventDateTime;
        trackerLogData.createdAt = eventDateTime;
        trackerLogData.updatedAt = eventDateTime;

        return trackerLog
        .create(trackerLogData,{
          transaction: options.transaction
        });
      })
      .then(function(results){

          if(updatedInstance.type == "general"){
            // General delivery
            // Send message to the sender about delivery of his/her order to the receiver
            content = fs.readFileSync("./views/message/delivered.handlebars");
            contentTemplate = handlebars.compile(content.toString());
            messageBody = contentTemplate({ parcelInstance: updatedInstance });

            messageUtils.sendMessage(updatedInstance.sender , messageBody , function(data){
              console.log(data);
            });

          }else{

          }
      });
    }
  }

  return pstatus
  .then(function(result){
    return next();
  });
});

order.hook("beforeDestroy" , function(orderItem , options){

  return orderItem
  .getTracker({
    transaction: options.transaction
  })
  .then(function(trackerItem){
    if(trackerItem){
        return trackerItem.destroy({
          transaction: options.transaction
        });
    }
  });
});
