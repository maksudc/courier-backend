var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var ShipmentModel = sequelize.models.shipment;
var genericTracker = sequelize.models.genericTracker;

var RouteLogic = require("../logics/branchRouteLogic");
var Promise = require("bluebird");
var _ = require("lodash");

var statusStateMachine = ['draft','confirmed','ready','running','received','reached','forwarded','stocked','delivered','expired'];

ShipmentModel.hook("beforeUpdate" , function(instance , options , next){

  /**
    Check whether the status is changing or not.
    Change the tracker branch information appropriately
  **/
    //console.log(instance);
    console.log("Shipment Uuid: "  + instance.uuid);
    //console.log("Update Options: " + JSON.stringify(options));

    //ShipmentModel
    //.findOne({ where: { uuid: instance.uuid } })
    //.then(function(snapshotInstance){

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

          updatedInstance.previousBranchType = snapshotInstance.currentBranchType;
          updatedInstance.previousBranchId = snapshotInstance.currentBranchId;

          return RouteLogic.getRouteBetween(instance.sourceBranchType , instance.sourceBranchId , instance.destinationBranchType , instance.destinationBranchId , null)
          .then(function(routes){

            var firstRoute = null;
            if(updatedInstance.previousBranchType == "sub"){
              firstRoute = routes[0];
            }else{
              firstRoute = routes[1];
            }

            if(firstRoute){
              updatedInstance.nextBranchType = firstRoute.branchType;
              updatedInstance.nextBranchId = firstRoute.id;
            }

            instance.updatedInstance = updatedInstance;

            return Promise.resolve(updatedInstance.status);
          })
          .then(function(updatedStatus){

            // Get the tracker
            return instance.getTracker();
          }).then(function(trackerItem){

            if(trackerItem){

              // Update the tracker for consistency
              trackerItem.currentBranchType = updatedInstance.currentBranchType;
              trackerItem.currentBranchId = updatedInstance.currentBranchId;

              trackerItem.previousBranchType = updatedInstance.previousBranchType;
              trackerItem.previousBranchId = updatedInstance.previousBranchId;

              trackerItem.nextBranchType = updatedInstance.nextBranchType;
              trackerItem.nextBranchId = updatedInstance.nextBranchId;

              return trackerItem.save();
            }

            return Promise.resolve(0);
          })
          .then(function(updatedResult){

            instance.dataValues = updatedInstance;

            _.assignIn(instance._changed , { status: true });

            _.assignIn(instance._changed , { currentBranchId: true });
            _.assignIn(instance._changed , { currentBranchType: true });

            _.assignIn(instance._changed , { nextBranchId: true });
            _.assignIn(instance._changed , { nextBranchType: true });

            _.assignIn(instance._changed , { previousBranchId: true });
            _.assignIn(instance._changed , { previousBranchType: true });

            return next();
          });
        }
      }

      else if(snapshotInstance.status == "running"){
        //  a running shipment can be recieved or expired or reached
        if(updatedInstance.status == 'received'){

          //instance.previousBranchType = instance.currentBranchType;
          //instance.previousBranchId = instance.currentBranchId;

          updatedInstance.currentBranchType = snapshotInstance.nextBranchType;
          updatedInstance.currentBranchId = snapshotInstance.nextBranchId;

          if(updatedInstance.destinationBranchType == "regional"){
            if(updatedInstance.currentBranchId == updatedInstance.destinationBranchId){
              updatedInstance.status = "reached";
            }
          }else{
            // direct sub branch shipment unlikely
          }

          instance.updatedInstance = updatedInstance;

          return genericTracker
          .findOne({ where: { trackableType: "shipment" , trackableId:instance.uuid } })
          .then(function(trackerItem){

            if(trackerItem){

              trackerItem.currentBranchType = updatedInstance.currentBranchType;
              trackerItem.currentBranchId = updatedInstance.currentBranchId;

              trackerItem.previousBranchType = updatedInstance.previousBranchType;
              trackerItem.previousBranchId = updatedInstance.previousBranchId;

              trackerItem.nextBranchType = updatedInstance.nextBranchType;
              trackerItem.nextBranchId = updatedInstance.nextBranchId;

              return trackerItem.save();
            }
            return sequelize.Promise.resolve(0);
          })
          .then(function(updatedResult){

            instance.dataValues = updatedInstance;
            _.assignIn(instance._changed , { status: true });

            _.assignIn(instance._changed , { currentBranchId: true });
            _.assignIn(instance._changed , { currentBranchType: true });

            _.assignIn(instance._changed , { nextBranchId: true });
            _.assignIn(instance._changed , { nextBranchType: true });

            _.assignIn(instance._changed , { previousBranchId: true });
            _.assignIn(instance._changed , { previousBranchType: true });
            return next();
          });
        }
      }

      else if(snapshotInstance.status == "received"){

        // From received it can go to either running or reached state
        if(updatedInstance.status == 'running'){

          updatedInstance.previousBranchType = snapshotInstance.currentBranchType;
          updatedInstance.previousBranchId = snapshotInstance.currentBranchId;

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
              if( nextRouteIndex > -1){

                var nextRoute = routes[nextRouteIndex];
                if(nextRoute){
                  updatedInstance.nextBranchType = nextRoute.branchType;
                  updatedInstance.nextBranchId = nextRoute.id;
                }
              }
            }

            instance.updatedInstance = updatedInstance;
          })
          .then(function(){

            return instance.getTracker();
          })
          .then(function(trackerItem){

            if(trackerItem){
              trackerItem.currentBranchType = updatedInstance.currentBranchType;
              trackerItem.currentBranchId = updatedInstance.currentBranchId;

              trackerItem.previousBranchType = updatedInstance.previousBranchType;
              trackerItem.previousBranchId = updatedInstance.previousBranchId;

              trackerItem.nextBranchType = updatedInstance.nextBranchType;
              trackerItem.nextBranchId = updatedInstance.nextBranchId;

              return trackerItem.save();
            }

            return Promise.resolve(0);
          })
          .then(function(updatedResult){

            instance.dataValues = updatedInstance;

            _.assignIn(instance._changed , { status: true });

            _.assignIn(instance._changed , { currentBranchId: true });
            _.assignIn(instance._changed , { currentBranchType: true });

            _.assignIn(instance._changed , { nextBranchId: true });
            _.assignIn(instance._changed , { nextBranchType: true });

            _.assignIn(instance._changed , { previousBranchId: true });
            _.assignIn(instance._changed , { previousBranchType: true });
            return next();
          });
        }
      }

      _.assignIn(instance._changed , { status: true });

      _.assignIn(instance._changed , { currentBranchId: true });
      _.assignIn(instance._changed , { currentBranchType: true });

      _.assignIn(instance._changed , { nextBranchId: true });
      _.assignIn(instance._changed , { nextBranchType: true });

      _.assignIn(instance._changed , { previousBranchId: true });
      _.assignIn(instance._changed , { previousBranchType: true });
      return next();

      //return sequelize.Promise.resolve({ instance: instance , options:options , fn:fn });
    //});
});

ShipmentModel.hook("afterUpdate" , function(instance , options , next){

  // if the status is set to running
  // check whether any order under the shipment is still not reached and update them to running state
  var snapshotInstance = instance._previousDataValues;
  var updatedInstance = instance.dataValues;

  if(!instance.changed('status')){
    return next();
  }

  //if(updatedInstance.status == "running" ){

    return instance
    .getOrders()
    .map(function(orderInstance){

      //return Promise.map(orderInstances , function(orderInstance){
        readyStateIndex = statusStateMachine.indexOf("ready");
        preReachedStateIndex = statusStateMachine.indexOf("reached");
        orderStatusStateIndex = statusStateMachine.indexOf(orderInstance.status);
        shipmentStatusIndex = statusStateMachine.indexOf(updatedInstance.status);

        if(shipmentStatusIndex > readyStateIndex && shipmentStatusIndex < preReachedStateIndex){

          if(orderStatusStateIndex < preReachedStateIndex){
            orderInstance.status = updatedInstance.status;
            return orderInstance.save();
          }
        }else if(shipmentStatusIndex == preReachedStateIndex){

          if(orderStatusStateIndex < preReachedStateIndex){
            orderInstance.status = "received";
            return orderInstance.save();
          }
        }

      //});
    })
    .then(function(results){
      return next();
    });
  //}

  //return next();
});

module.exports = ShipmentModel;
