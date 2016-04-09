var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var order = sequelize.models.order;
var genericTracker = sequelize.models.genericTracker;
var item = sequelize.models.item;
var subBranch = sequelize.models.subBranch;
var regionalBranch = sequelize.models.regionalBranch;

var itemLogic = require("../logics/itemLogic");

item.hook("beforeCreate" , function(instance , options , next){

  if(!instance.current_hub_type){
    instance.current_hub_type = instance.entry_branch_type;
  }
  if(!instance.current_hub){
    instance.current_hub = instance.entry_branch;
  }

  return next(null , options);
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

        updatedInstance.current_hub_type = snapshotInstance.next_hub_type;
        updatedInstance.current_hub = snapshotInstance.next_hub;

        instance.updatedInstance = updatedInstance;

        var p1 = sequelize.Promise.resolve(null);

        if(updatedInstance.exit_branch_type=="sub"){

          p1 = subBranch
          .findOne({ where: { id: instance.exit_branch } })
          .then(function(exitSubBranchInstance){

            return exitSubBranchInstance.getRegionalBranch();
          }).then(function(exitRegionalBranchInstance){

            if(exitRegionalBranchInstance.id == updatedInstance.current_hub && exitRegionalBranchInstance.branchType == updatedInstance.current_hub_type){
              updatedInstance.status = "reached";

              return Promise.resolve(updatedInstance.status);
            }
            return Promise.resolve(updatedInstance.status);
            //instance.updatedInstance = updatedInstance;
          });
        }else if(updatedInstance.exit_branch_type == "regional"){

          if(updatedInstance.current_hub_type == updatedInstance.exit_branch_type && updatedInstance.current_hub == updatedInstance.exit_branch){
            updatedInstance.status = "stocked";
          }
          p1 = Promise.resolve(updatedInstance.status);
        }

        var p2 = genericTracker
        .findOne({ where: { trackableType: "orderItem" , trackableId:instance.uuid } })
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
          return sequelize.Promise.resolve(trackerItem);
        })
        .then(function(updatedResult){

          console.log("Returning to saving shipment");
        });

        return Promise
        .all([p1 , p2])
        .then(function(results){
          return next();
        });

      }
    }

    else if(snapshotInstance.status == "received"){

      // From received it can go to either running or reached state
      if(updatedInstance.status == 'running'){

        //updatedInstance.previousBranchType = snapshotInstance.currentBranchType;
        //updatedInstance.previousBranchId = snapshotInstance.currentBranchId;

        return RouteLogic.getRouteBetween(instance.sourceBranchType , instance.sourceBranchId , instance.destinationBranchType , instance.destinationBranchId , null)
        .then(function(routes){

          if(routes && routes.constructor == Array && Object.keys(routes).length > 0 ){

            var nextRouteIndex = -1;

            for(routeIndex = 0 ;  routeIndex < routes.length ; routeIndex++ ){

              routeItem = routes[routeIndex];
              if(routeItem.id == updatedInstance.previousBranchId){
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
