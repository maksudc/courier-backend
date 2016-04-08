var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var ShipmentModel = sequelize.models.shipment;
var RouteLogic = require("../logics/branchRouteLogic");

ShipmentModel.hook("beforeUpdate" , function(instance , options , next){

  /**
    Check whether the status is changing or not.
    Change the tracker branch information appropriately
  **/
    //console.log(instance);
    console.log(instance);
    console.log(options);

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
            if(instance.previousBranchType == "sub"){
              firstRoute = routes[0];
            }else{
              firstRoute = routes[1];
            }
            updatedInstance.nextBranchType = firstRoute.branchType;
            updatedInstance.nextBranchId = firstRoute.id;

            instance.updatedInstance = updatedInstance;

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
        }

        instance.updatedInstance = updatedInstance;
        return next();
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
              if( nextRouteIndex > -1 ){

                var nextRoute = routes[nextRouteIndex];
                updatedInstance.nextBranchType = nextRoute.branchType;
                updatedInstance.nextBranchId = nextRoute.id;
              }
            }

            instance.updatedInstance = updatedInstance;
            return next();
          });
        }
      }

      return next();

      //return sequelize.Promise.resolve({ instance: instance , options:options , fn:fn });
    //});
});

module.exports = ShipmentModel;
