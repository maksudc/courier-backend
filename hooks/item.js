var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var order = sequelize.models.order;
var genericTracker = sequelize.models.genericTracker;
var item = sequelize.models.item;
var subBranch = sequelize.models.subBranch;
var regionalBranch = sequelize.models.regionalBranch;
var trackerLog = sequelize.models.trackerLog;
var moduleSettings = require("../config/moduleSettings");

var itemLogic = require("../logics/itemLogic");
var RouteLogic = require("../logics/branchRouteLogic");

var Promise = require("bluebird");
var _ = require("lodash");
var moment = require("moment");

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

item.hook("afterUpdate" ,function(instance , options , next){

  var updatedInstance = instance.dataValues;
  var snapshotInstance = instance._previousDataValues;

  if(!instance.changed('status') || updatedInstance.status == snapshotInstance.status){
    return next();
  }

  if(updatedInstance.status == 'delivered'){
    if(moduleSettings.ENABLE_ITEM_TRACKING && instance){

      instance
      .getTracker()
      .then(function(trackerInstance){
          var trackerLogData = {};
          trackerLogData.action = "delivered";
          trackerLogData.trackerId = trackerInstance.uuid;
          if(trackerInstance.currentBranchType){
              trackerLogData.branchType = trackerInstance.currentBranchType;
          }
          trackerLogData.branchId = trackerInstance.currentBranchId;

          var eventDateTime = moment.utc();
          trackerLogData.eventDateTime = eventDateTime;
          trackerLogData.createdAt = eventDateTime;
          trackerLogData.updatedAt = eventDateTime;

          return trackerLog
                .create(trackerLogData);
      })
      .then(function(result){
        return next();
      })
      .catch(function(err){
        if(err){
          console.error(err.stack);
        }
        console.error("**Log addition for order item error. Ignored and passed**");
        return next();
      });
    }
  }
  return next();
});

item.hook("beforeCreate" , function(instance , options , next){

  //console.log("Before creation.....");
  //console.log(instance);
  //console.log("OrderUUid: ");
  //console.log(instance.orderUuid);

  //console.log("options..");
  //console.log(options);

  var snapshotInstance = instance._previousDataValues;
  var updatedInstance = instance.dataValues;

  if(updatedInstance.orderUuid){

    return order
    .findOne({ where: { uuid: updatedInstance.orderUuid } })
    .then(function(parentOrderInstance){

      //console.log("Parent Order Instance...");
      //console.log(parentOrderInstance);

      if(parentOrderInstance){

        if(parentOrderInstance.entry_branch_type){

          entry_branch_type_parts = parentOrderInstance.entry_branch_type.split("-");
          if(entry_branch_type_parts.length > 0){
            instance.entry_branch_type = entry_branch_type_parts[0];
          }
        }
        if(parentOrderInstance.entry_branch){
          instance.entry_branch = parentOrderInstance.entry_branch;
        }

        if(parentOrderInstance.exit_branch_type){

          exit_branch_type_parts = parentOrderInstance.exit_branch_type.split("-");
          if(exit_branch_type_parts.length > 0){
            instance.exit_branch_type = exit_branch_type_parts[0];
          }
        }
        if(parentOrderInstance.exit_branch){
          instance.exit_branch = parentOrderInstance.exit_branch;
        }

        if(parentOrderInstance.current_hub_type){

          branch_parts = parentOrderInstance.current_hub_type.split("-");
          if(branch_parts.length > 0){
            instance.current_hub_type = branch_parts[0];
          }
        }
        if(parentOrderInstance.current_hub){
          instance.current_hub = parentOrderInstance.current_hub;
        }

        if(parentOrderInstance.next_hub_type){

          branch_parts = parentOrderInstance.next_hub_type.split("-");
          if(branch_parts.length > 0){
            instance.next_hub_type = branch_parts[0];
          }
        }
        if(parentOrderInstance.next_hub){
          instance.next_hub = parentOrderInstance.next_hub;
        }
      }
    })
    .then(function(){

      return next();
    });
  }

  return next();
});

item.hook("beforeUpdate" , function(instance , options , next){

    var updatedInstance = instance.dataValues;
    var snapshotInstance = instance._previousDataValues;

    console.log("Snapshot order Item : " + snapshotInstance.uuid);
    console.log("Snapshot Status:  " + snapshotInstance.status);
    console.log("Order Item Updated status: " + updatedInstance.status);

    if(!instance.changed('status')){
      return next();
    }

    if(snapshotInstance.status == "ready" || snapshotInstance.status == "confirmed"){
      // can be switched to running
      if(updatedInstance.status == "running"){

        // set the previous branch to the current branch
        // Get the route for the source and destination
        // set the next branch to the next regional route

        //updatedInstance.previousBranchType = snapshotInstance.currentBranchType;
        //updatedInstance.previousBranchId = snapshotInstance.currentBranchId;

        updatedInstance.current_hub = updatedInstance.entry_branch;
        updatedInstance.current_hub_type = sanitizeBranchType(updatedInstance.entry_branch_type);

        return RouteLogic.getRouteBetween(sanitizeBranchType(instance.entry_branch_type) , instance.entry_branch , sanitizeBranchType(instance.exit_branch_type) , instance.exit_branch , null)
        .then(function(routes){

          var firstRoute = null;
          if(instance.current_hub_type == "sub"){
            firstRoute = routes[0];
          }else{
            firstRoute = routes[1];
          }

          console.log('consolidated route: ');

          if(firstRoute){

              updatedInstance.next_hub_type = firstRoute.branchType;
              updatedInstance.next_hub = firstRoute.id;

              console.log(firstRoute.branchType + ":" + firstRoute.id);
          }

          //instance.updatedInstance = updatedInstance;

          return Promise.resolve(updatedInstance.status);
        })
        .then(function(currentStatus){

          // Get the tracker
          if(moduleSettings.ENABLE_ITEM_TRACKING && instance){
              return instance.getTracker();
          }
          return Promise.resolve(null);
        }).then(function(trackerItem){

          if(moduleSettings.ENABLE_ITEM_TRACKING && trackerItem){

            console.log("Got the tracker item: "+ trackerItem.uuid);
            // Update the tracker for consistency
            trackerItem.currentBranchType = updatedInstance.current_hub_type;
            trackerItem.currentBranchId = updatedInstance.current_hub;

            trackerItem.previousBranchType = updatedInstance.current_hub_type;
            trackerItem.previousBranchId = updatedInstance.current_hub;

            trackerItem.nextBranchType = updatedInstance.next_hub_type;
            trackerItem.nextBranchId = updatedInstance.next_hub;

            return trackerItem.save();
          }

          return Promise.resolve(trackerItem);
        })
        .then(function(updatedResult){

          //instance.dataValues = updatedInstance;
          instance.dataValues = updatedInstance;

            _.assignIn(instance._changed , { status: true });
            _.assignIn(instance._changed , { current_hub: true });
            _.assignIn(instance._changed , { current_hub_type: true });
            _.assignIn(instance._changed , { next_hub: true });
            _.assignIn(instance._changed , { next_hub_type: true });

          return next();
        });
      }
    }

    else if(snapshotInstance.status == "running"){
      //  a running shipment can be recieved or expired or reached
      if(updatedInstance.status == 'received'){
        //instance.previousBranchType = instance.currentBranchType;
        //instance.previousBranchId = instance.currentBranchId;
        updatedInstance.current_hub_type = updatedInstance.next_hub_type;
        updatedInstance.current_hub = updatedInstance.next_hub;

        instance.updatedInstance = updatedInstance;

        var p1 = sequelize.Promise.resolve(updatedInstance.status);

        if(updatedInstance.current_hub_type == sanitizeBranchType(updatedInstance.exit_branch_type) &&
              updatedInstance.current_hub == updatedInstance.exit_branch){

          updatedInstance.status = "stocked";

          return sequelize.Promise.resolve(updatedInstance.status).then(function(updatedStatus){
            console.log("Extra Updated item instance");
            console.log(updatedStatus);
            if(moduleSettings.ENABLE_ITEM_TRACKING && instance){
                return instance.getTracker();
            }
            return Promise.resolve(null);
          })
          .then(function(trackerItem){

            if(moduleSettings.ENABLE_ITEM_TRACKING && trackerItem){

              console.log("Got the tracker Item: "+ trackerItem.uuid);

              trackerItem.currentBranchType = updatedInstance.current_hub_type;
              trackerItem.currentBranchId = updatedInstance.current_hub;

              trackerItem.previousBranchType = updatedInstance.current_hub_type;
              trackerItem.previousBranchId = updatedInstance.current_hub;

              trackerItem.nextBranchType = updatedInstance.next_hub_type;
              trackerItem.nextBranchId = updatedInstance.next_hub;

              return trackerItem.save();
            }
            return Promise.resolve(trackerItem);
          })
          .then(function(updatedResult){

            instance.dataValues = updatedInstance;

              _.assignIn(instance._changed , { status: true });
              _.assignIn(instance._changed , { current_hub: true });
              _.assignIn(instance._changed , { current_hub_type: true });
              _.assignIn(instance._changed , { next_hub: true });
              _.assignIn(instance._changed , { next_hub_type: true });
            return next();
          });

        }else{

          var destinationModel = null;

          if(sanitizeBranchType(updatedInstance.exit_branch_type) == "sub"){
            destinationModel = subBranch;
          }else if(sanitizeBranchType(updatedInstance.exit_branch_type) == "regional"){
            destinationModel = regionalBranch;
          }

          if(destinationModel){

             return destinationModel
            .findOne({ where: { id: instance.exit_branch } })
            .then(function(exitBranchInstance){

              if(exitBranchInstance){
                if(exitBranchInstance.branchType == "regional"){
                  return Promise.resolve(exitBranchInstance);
                }else{
                  return exitBranchInstance.getRegionalBranch();
                }
              }
            })
            .then(function(exitRegionalBranchInstance){
              if(exitRegionalBranchInstance){
                if(exitRegionalBranchInstance.id == updatedInstance.current_hub && exitRegionalBranchInstance.branchType == updatedInstance.current_hub_type){
                  updatedInstance.status = "reached";
                }
              }
              return Promise.resolve(updatedInstance.status);

            }).then(function(updatedStatus){
              console.log("Extra Updated order item Status");
              console.log(updatedStatus);
              //console.log(updatedInstance);
              if(moduleSettings.ENABLE_ITEM_TRACKING && instance){
                  return instance.getTracker();
              }
              return Promise.resolve(null);
            })
            .then(function(trackerItem){

              if(moduleSettings.ENABLE_ITEM_TRACKING && trackerItem){

                console.log("Got the tracker Item: "+ trackerItem.uuid);

                trackerItem.currentBranchType = updatedInstance.current_hub_type;
                trackerItem.currentBranchId = updatedInstance.current_hub;

                trackerItem.previousBranchType = updatedInstance.current_hub_type;
                trackerItem.previousBranchId = updatedInstance.current_hub;

                trackerItem.nextBranchType = updatedInstance.next_hub_type;
                trackerItem.nextBranchId = updatedInstance.next_hub;

                return trackerItem.save();
              }
              return Promise.resolve(trackerItem);
            })
            .then(function(updatedResult){
              instance.dataValues = updatedInstance;

                _.assignIn(instance._changed , { status: true });
                _.assignIn(instance._changed , { current_hub: true });
                _.assignIn(instance._changed , { current_hub_type: true });
                _.assignIn(instance._changed , { next_hub: true });
                _.assignIn(instance._changed , { next_hub_type: true });
              return next();
            });
          }
        }

        instance.dataValues = updatedInstance;

          _.assignIn(instance._changed , { status: true });
          _.assignIn(instance._changed , { current_hub: true });
          _.assignIn(instance._changed , { current_hub_type: true });
          _.assignIn(instance._changed , { next_hub: true });
          _.assignIn(instance._changed , { next_hub_type: true });
        return next();
      }
    }

    else if(snapshotInstance.status == "received"){

      // From received it can go to either running or reached state
      if(updatedInstance.status == 'running'){

        //updatedInstance.previousBranchType = snapshotInstance.currentBranchType;
        //updatedInstance.previousBranchId = snapshotInstance.currentBranchId;

        return RouteLogic.getRouteBetween(sanitizeBranchType(instance.entry_branch_type) , instance.entry_branch , sanitizeBranchType(instance.exit_branch_type) , instance.exit_branch , null)
        .then(function(routes){

          if(routes && routes.constructor == Array && Object.keys(routes).length > 0 ){

            var nextRouteIndex = -1;

            for(routeIndex = 0 ;  routeIndex < routes.length ; routeIndex++ ){

              routeItem = routes[routeIndex];
              if(routeItem.id == updatedInstance.current_hub && routeItem.branchType == updatedInstance.current_hub_type){
                nextRouteIndex = routeIndex + 1;
                break;
              }
            }
            if( nextRouteIndex > -1 ){

              var nextRoute = routes[nextRouteIndex];
              updatedInstance.next_hub_type = nextRoute.branchType;
              updatedInstance.next_hub = nextRoute.id;
            }
          }

          instance.updatedInstance = updatedInstance;
        })
        .then(function(){
          if(moduleSettings.ENABLE_ITEM_TRACKING && instance){
              return instance.getTracker();
          }
          return Promise.resolve(null);
        })
        .then(function(trackerItem){

          if(moduleSettings.ENABLE_ITEM_TRACKING && trackerItem){
            trackerItem.currentBranchType = updatedInstance.current_hub_type;
            trackerItem.currentBranchId = updatedInstance.current_hub;

            trackerItem.previousBranchType = updatedInstance.current_hub_type;
            trackerItem.previousBranchId = updatedInstance.current_hub;

            trackerItem.nextBranchType = updatedInstance.next_hub_type;
            trackerItem.nextBranchId = updatedInstance.next_hub;

            return trackerItem.save();
          }
          return Promise.resolve(trackerItem);
        })
        .then(function(updatedResult){

          instance.dataValues = updatedInstance;

            _.assignIn(instance._changed , { status: true });
            _.assignIn(instance._changed , { current_hub: true });
            _.assignIn(instance._changed , { current_hub_type: true });
            _.assignIn(instance._changed , { next_hub: true });
            _.assignIn(instance._changed , { next_hub_type: true });

          return next();
        });
      }
    }

    else if(snapshotInstance.status == "reached"){
      if(updatedInstance.status == "running"){

        if(updatedInstance.exit_branch_type == "sub" && updatedInstance.current_hub_type == "regional"){

          updatedInstance.next_hub_type = updatedInstance.exit_branch_type;
          updatedInstance.next_hub = updatedInstance.exit_branch;
        }

        return Promise.resolve(null)
        .then(function(){
          if(moduleSettings.ENABLE_ITEM_TRACKING && instance){
              return instance.getTracker();
          }
          return Promise.resolve(null);
        })
        .then(function(trackerItem){

          if(moduleSettings.ENABLE_ITEM_TRACKING && trackerItem){
            trackerItem.currentBranchType = updatedInstance.current_hub_type;
            trackerItem.currentBranchId = updatedInstance.current_hub;

            trackerItem.previousBranchType = updatedInstance.current_hub_type;
            trackerItem.previousBranchId = updatedInstance.current_hub;

            trackerItem.nextBranchType = updatedInstance.next_hub_type;
            trackerItem.nextBranchId = updatedInstance.next_hub;

            return trackerItem.save();
          }

          return Promise.resolve(trackerItem);
        })
        .then(function(updatedResult){

          instance.dataValues = updatedInstance;

            _.assignIn(instance._changed , { status: true });
            _.assignIn(instance._changed , { current_hub: true });
            _.assignIn(instance._changed , { current_hub_type: true });
            _.assignIn(instance._changed , { next_hub: true });
            _.assignIn(instance._changed , { next_hub_type: true });

          return next();
        });
      }
    }else if(snapshotInstance.status == 'stocked'){
      if(updatedInstance.status == "delivered"){

      }else{
        updatedInstance.status = snapshotInstance.status;
      }
    }

    instance.dataValues = updatedInstance;

      _.assignIn(instance._changed , { status: true });
      _.assignIn(instance._changed , { current_hub: true });
      _.assignIn(instance._changed , { current_hub_type: true });
      _.assignIn(instance._changed , { next_hub: true });
      _.assignIn(instance._changed , { next_hub_type: true });
    return next();
});
