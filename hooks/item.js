var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var order = sequelize.models.order;
var genericTracker = sequelize.models.genericTracker;
var item = sequelize.models.item;
var subBranch = sequelize.models.subBranch;
var regionalBranch = sequelize.models.regionalBranch;
var trackerLog = sequelize.models.trackerLog;

var itemLogic = require("../logics/itemLogic");
var RouteLogic = require("../logics/branchRouteLogic");
var Promise = require("bluebird");

item.hook("afterUpdate" ,function(instance , options , next){

  var updatedInstance = instance.dataValues;
  var snapshotInstance = instance._previousDataValues;

  if(!instance.changed('status')){
    return next();
  }

  var pstatus = Promise.resolve(null);
  if(updatedInstance.status == 'delivered'){

    pstatus = instance
    .getTracker()
    .then(function(trackerInstance){

      if(trackerInstance){

        var trackerLogData = {};

        trackerLogData.action = "delivered";
        trackerLogData.trackerId = trackerInstance.uuid;
        if(trackerInstance.currentBranchType){
            trackerLogData.branchType = trackerInstance.currentBranchType;
        }
        trackerLogData.branchId = trackerInstance.currentBranchId;

        return trackerLog
        .create(trackerLogData);
      }
    })
    .then(function(trackerLogItem){
      //return next();
    });
  }

  pstatus
  .then(function(){
    return next();
  });
});

item.hook("beforeCreate" , function(instance , options , next){

  //console.log("Before creation.....");
  //console.log(instance);
  //console.log("OrderUUid: ");
  //console.log(instance.orderUuid);

  //console.log("options..");
  //console.log(options);

  if(instance.orderUuid){

    return order
    .findOne({ where: { uuid: instance.orderUuid } })
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

      if(!instance.current_hub_type){
        instance.current_hub_type = instance.entry_branch_type;
      }
      if(!instance.current_hub){
        instance.current_hub = instance.entry_branch;
      }

      return next();
    });
  }

  return next();
});

item.hook("beforeUpdate" , function(instance , options , next){

    var updatedInstance = instance.dataValues;
    var snapshotInstance = instance._previousDataValues;

    console.log("Snapshot : " + snapshotInstance.uuid);
    console.log("Instance Id: " + updatedInstance.uuid);

    console.log(" Snapshot Status:  " + snapshotInstance.status);
    console.log("Instance status: " + updatedInstance.status);

    if(!instance.changed('status')){
      return next();
    }

    if(snapshotInstance.status == "ready"){
      // can be switched to running
      if(updatedInstance.status == "running"){

        // set the previous branch to the current branch
        // Get the route for the source and destination
        // set the next branch to the next regional route

        //updatedInstance.previousBranchType = snapshotInstance.currentBranchType;
        //updatedInstance.previousBranchId = snapshotInstance.currentBranchId;

        return RouteLogic.getRouteBetween(instance.entry_branch_type , instance.entry_branch , instance.exit_branch_type , instance.exit_branch , null)
        .then(function(routes){

          var firstRoute = null;
          if(instance.current_hub_type == "sub"){
            firstRoute = routes[0];
          }else{
            firstRoute = routes[1];
          }
          updatedInstance.next_hub_type = firstRoute.branchType;
          updatedInstance.next_hub = firstRoute.id;

          instance.updatedInstance = updatedInstance;
        })
        .then(function(){

          // Get the tracker
          return instance.getTracker();
        }).then(function(trackerItem){

          if(trackerItem){

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

          return next();
        });
      }
    }

    else if(snapshotInstance.status == "running"){
      //  a running shipment can be recieved or expired or reached
      if(updatedInstance.status == 'received'){

        //instance.previousBranchType = instance.currentBranchType;
        //instance.previousBranchId = instance.currentBranchId;

        console.log("Inside processor");

        updatedInstance.current_hub_type = updatedInstance.next_hub_type;
        updatedInstance.current_hub = updatedInstance.next_hub;

        instance.current_hub_type = updatedInstance.next_hub_type;
        instance.current_hub = updatedInstance.next_hub;

        instance.updatedInstance = updatedInstance;

        var p1 = sequelize.Promise.resolve(updatedInstance.status);

        if(updatedInstance.current_hub_type == updatedInstance.exit_branch_type && updatedInstance.current_hub == updatedInstance.exit_branch){
          updatedInstance.status = "stocked";
          p1 = sequelize.Promise.resolve(updatedInstance.status);
        }else{

          if(updatedInstance.exit_branch_type=="sub"){

            p1 = subBranch
            .findOne({ where: { id: instance.exit_branch } })
            .then(function(exitSubBranchInstance){

              return exitSubBranchInstance.getRegionalBranch();
            })
            .then(function(exitRegionalBranchInstance){

              if(exitRegionalBranchInstance.id == updatedInstance.current_hub && exitRegionalBranchInstance.branchType == updatedInstance.current_hub_type){
                updatedInstance.status = "reached";
              }
              return Promise.resolve(updatedInstance.status);
            });
          }
        }

        return p1
        .then(function(updatedStatus){
          console.log(updatedStatus);
          console.log("On instance story...");
          //console.log(instance);
          console.log("Updated instance");
          //console.log(updatedInstance);

          return instance.getTracker();
        })
        .then(function(trackerItem){

          console.log("Got the tracker Item: "+ trackerItem.uuid);

          if(trackerItem){

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

          console.log("Returning to saving shipment");
        })
        .then(function(){

          return next();
        });
      }
    }

    else if(snapshotInstance.status == "received"){

      // From received it can go to either running or reached state
      if(updatedInstance.status == 'running'){

        //updatedInstance.previousBranchType = snapshotInstance.currentBranchType;
        //updatedInstance.previousBranchId = snapshotInstance.currentBranchId;

        return RouteLogic.getRouteBetween(instance.entry_branch_type , instance.entry_branch , instance.exit_branch_type , instance.exit_branch , null)
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

          return instance.getTracker();
        })
        .then(function(trackerItem){

          if(trackerItem){
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

        return instance.getTracker()
        .then(function(trackerItem){

          if(trackerItem){
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

          return next();
        });

      }
    }

    return next();
});
