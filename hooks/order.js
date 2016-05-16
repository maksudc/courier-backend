var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var genericTracker = sequelize.models.genericTracker;
var order = sequelize.models.order;
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

  console.log("Order before creation");

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

order.hook('afterCreate' , function(instance , options , next){

    /**
      * Need to check whether the client of the
    **/

});

order.hook("afterUpdate" , function(instance , options , next){

  // if the order is in running state
  // all the items inside it should be also in running state as well

  var snapshotInstance = instance._previousDataValues;
  var updatedInstance = instance.dataValues;

  var orderInstance = instance;
  //console.log("instances : " + JSON.stringify(orderInstances));
  console.log(" on order after update hook for: "+ orderInstance.uuid);
    //console.log(orderInstance);
    //console.log(options);
  console.log(" Whether shipment changed ? " + orderInstance.changed('shipmentUuid'));

  var pstatus = Promise.resolve(null);
  var pshipment = Promise.resolve(null);

  if(instance.changed('status')){

    if(updatedInstance.status == 'running' || updatedInstance.status == "received" || updatedInstance.status == "reached" || updatedInstance.status == "stocked"){

      pstatus =instance
      .getItems()
      .map(function(itemInstance){
          itemInstance.status = updatedInstance.status;
          return itemInstance.save();
      })
      .then(function(results){
        return Promise.resolve(results);
      })
      .then(function(){

        if(updatedInstance.status == 'stocked'){

          console.log("Sending message...");

          branchUtils
          .getBranchInstance(updatedInstance.exit_branch_type , updatedInstance.exit_branch , null)
          .then(function(exitBranchInstance){

            if(exitBranchInstance.branchType == "sub"){
              return Promise.all([ Promise.resolve(exitBranchInstance) , exitBranchInstance.getRegionalBranch() ]);
            }else{
              return Promise.all([ Promise.resolve(null) , Promise.resolve(exitBranchInstance) ]);
            }
          })
          .then(function(results){

            messageBranchInstance = {};
            messageBranchInstance = results[0];
            if(!messageBranchInstance){
              messageBranchInstance = results[1];
            }else{
              messageBranchInstance.regionalBranch = results[1];
            }
            // Send message to the receiver about stocking of his/her order
            content = fs.readFileSync("./views/message/stocked.handlebars");
            contentTemplate = handlebars.compile(content.toString());
            messsageBody = contentTemplate({ parcelInstance: updatedInstance , branchInstance: messageBranchInstance });

            messageUtils.sendMessage(updatedInstance.receiver , messsageBody , function(data){
              console.log(data);
            });
          });
        }
      });

    }else if(updatedInstance.status == "delivered"){

      // Insert into tracker logs for final delivery of the order
      pstatus = instance
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
      .then(function(trackerLogItem){
        //return next();
      })
      .then(function(){

        //Noe mark the items under this order as delivered
        return item.update({ status: 'delivered' } , {  where:{ orderUuid: updatedInstance.uuid } , individualHooks:true });
      })
      .then(function(results){

        // Send mobile message accordingly
        return branchUtils
        .getBranchInstance(updatedInstance.exit_branch_type , updatedInstance.exit_branch , null)
        .then(function(exitBranchInstance){

          if(exitBranchInstance.branchType == "sub"){
            return Promise.all([ Promise.resolve(exitBranchInstance) , exitBranchInstance.getRegionalBranch() ]);
          }else{
            return Promise.all([ Promise.resolve(null) , Promise.resolve(exitBranchInstance) ]);
          }
        })
        .then(function(results){

          messageBranchInstance = {};
          messageBranchInstance = results[0];
          if(!messageBranchInstance){
            messageBranchInstance = results[1];
          }else{
            messageBranchInstance.regionalBranch = results[1];
          }
          // Send message to the sender about delivery of his/her order to the receiver
          content = fs.readFileSync("./views/message/delivered.handlebars");
          contentTemplate = handlebars.compile(content.toString());
          messageBody = contentTemplate({ parcelInstance: updatedInstance });

          messageUtils.sendMessage(updatedInstance.sender , messageBody , function(data){
            console.log(data);
          });
        });
      });
    }
  }

    if(orderInstance.changed("shipmentUuid")){
      // changed the shipment , so trigger the change in tracker parent

      pshipment = orderInstance
      .getShipment()
      .then(function(shipmentInstance){

        var p1 = shipmentInstance.getTracker();
        var p2 = orderInstance.getTracker();

        return sequelize.Promise.all([p1 , p2]);
      })
      .then(function(results){

        //console.log(" Trackers:  "+ JSON.stringify(results));
        var parentTrackerInstance = results[0];
        var childTrackerInstance = results[1];

        if(parentTrackerInstance){
          if(childTrackerInstance){

            childTrackerInstance.parentTrackerId = parentTrackerInstance.uuid;
            return childTrackerInstance.save();
          }
        }

        return Promise.resolve(0);
      })
      .then(function(updateResult){
        //console.log("Updated : " + updateResult);
        //return next();
      });

    }

    return pstatus
    .then(function(result){
      return pshipment;
    })
    .then(function(result){
      return next();
    });
});

order.hook("beforeUpdate" , function(instance , options , next){

  var updatedInstance = instance.dataValues;
  var snapshotInstance = instance._previousDataValues;

  console.log("Snapshot : " + snapshotInstance.uuid);
  console.log("Instance Id: " + updatedInstance.uuid);

  console.log(" Snapshot Status:  " + snapshotInstance.status);
  console.log("Instance status: " + updatedInstance.status);

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

      instance.set("current_hub" , updatedInstance.entry_branch);
      instance.set("current_hub_type" , sanitizeBranchType(updatedInstance.entry_branch_type));

      return RouteLogic.getRouteBetween(sanitizeBranchType(instance.entry_branch_type) , instance.entry_branch , sanitizeBranchType(instance.exit_branch_type) , instance.exit_branch , null)
      .then(function(routes){

        var firstRoute = null;
        if(updatedInstance.current_hub_type == "sub"){
          firstRoute = routes[0];
        }else{
          firstRoute = routes[1];

          // started off directly the regional branch , so send the message since it is running
          console.log("starting the message sending to let know the sender of the starting of the journey...");

          branchUtils
          .getBranchInstance( updatedInstance.exit_branch_type , updatedInstance.exit_branch , null)
          .then(function(exitBranchInstance){

            if(exitBranchInstance.branchType == "sub"){
              return Promise.all([ Promise.resolve(exitBranchInstance) , exitBranchInstance.getRegionalBranch() ]);
            }else{
              return Promise.all([ Promise.resolve(null) , Promise.resolve(exitBranchInstance) ]);
            }
          })
          .then(function(results){

            messageBranchInstance = {};
            messageBranchInstance = results[0];
            if(!messageBranchInstance){
              messageBranchInstance = results[1];
            }else{
              messageBranchInstance.regionalBranch = results[1];
            }
            // Send message to the sender about starting of the journey of his/her order to the receiver
            content = fs.readFileSync("./views/message/start.handlebars");
            contentTemplate = handlebars.compile(content.toString());
            messageBody =  contentTemplate({ parcelInstance: updatedInstance });

            messageUtils.sendMessage(updatedInstance.sender , messageBody , function(data){
              console.log(data);
            });
          });

        }

        console.log("Adjusted Route is : ");
        if(firstRoute !== null){
            console.log(firstRoute.branchType + ":" +firstRoute.id);

            updatedInstance.next_hub_type = firstRoute.branchType;
            updatedInstance.next_hub = firstRoute.id;

            instance.set("next_hub_type" , firstRoute.branchType);
            instance.set('next_hub' , firstRoute.id);
        }

        //instance.updatedInstance = updatedInstance;
        console.log("After adjusting next :....");
        console.log(instance.next_hub_type);
        console.log(instance.next_hub);

        return Promise.resolve(updatedInstance.status);
      })
      .then(function(statusResult){

        // Get the tracker
        return instance.getTracker();
      }).then(function(trackerItem){

        if(trackerItem){

          // Update the tracker for consistency
          trackerItem.currentBranchType = sanitizeBranchType(updatedInstance.current_hub_type);
          trackerItem.currentBranchId = updatedInstance.current_hub;

          trackerItem.previousBranchType = sanitizeBranchType(updatedInstance.current_hub_type);
          trackerItem.previousBranchId = updatedInstance.current_hub;

          trackerItem.nextBranchType = sanitizeBranchType(updatedInstance.next_hub_type);
          trackerItem.nextBranchId = updatedInstance.next_hub;

          console.log(" updated tracker Item...");
          console.log(trackerItem.uuid);

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

  else if(snapshotInstance.status == "running"){
    //  a running shipment can be recieved or expired or reached
    if(updatedInstance.status == 'received'){

      //instance.previousBranchType = instance.currentBranchType;
      //instance.previousBranchId = instance.currentBranchId;

      console.log("Inside processor");

      updatedInstance.current_hub_type = updatedInstance.next_hub_type;
      updatedInstance.current_hub = updatedInstance.next_hub;

      //instance.set("current_hub_type"  , updatedInstance.next_hub_type);
      //instance.set("current_hub"  ,updatedInstance.next_hub);

      //instance.updatedInstance = updatedInstance;

      instance.dataValues = updatedInstance;

      var p1 = sequelize.Promise.resolve(updatedInstance.status);

      if(updatedInstance.current_hub_type == sanitizeBranchType(updatedInstance.exit_branch_type) && updatedInstance.current_hub == updatedInstance.exit_branch){
        updatedInstance.status = "stocked";

        return instance.getTracker()
        .then(function(trackerItem){

          if(trackerItem){

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

          console.log("Returning to saving shipment");
          instance.dataValues = updatedInstance;

            _.assignIn(instance._changed , { status: true });
            _.assignIn(instance._changed , { current_hub: true });
            _.assignIn(instance._changed , { current_hub_type: true });
            _.assignIn(instance._changed , { next_hub: true });
            _.assignIn(instance._changed , { next_hub_type: true });

            return next();

        });
        // .then(function(){
        //    // moved to after update
        //   // Send message to the receiver about stocing of his/her order
        //   messageUtils.sendMessage(updatedInstance.receiver , "Order from " + JSON.stringify(updatedInstance.sender) + " for you has reached " , function(data){
        //     console.log(data);
        //   });
        // })
        // .then(function(){
        //     return next();
        // });

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

            if(exitRegionalBranchInstance.id == updatedInstance.current_hub && exitRegionalBranchInstance.branchType == updatedInstance.current_hub_type){
              updatedInstance.status = "reached";
            }
            return Promise.resolve(updatedInstance.status);
          }).then(function(updatedStatus){
            console.log(updatedStatus);
            console.log("On instance story...");
            //console.log(instance);
            console.log("Updated instance");
            //console.log(updatedInstance);

            return instance.getTracker();
          })
          .then(function(trackerItem){

            if(trackerItem){

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

            console.log("Returning to saving shipment");

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

      //return next();
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
          if( nextRouteIndex > -1 && nextRouteIndex < routes.length ){

            nextRoute = routes[nextRouteIndex];

            updatedInstance.next_hub_type = nextRoute.branchType;
            updatedInstance.next_hub = nextRoute.id;

            instance.set("next_hub_type" , nextRoute.branchType);
            instance.set("next_hub" , nextRoute.id);

            //Check whether the order has started off the regional branch or not
            if(nextRouteIndex==1){
              // just started off the regional branch
              // So let the sender know of the status
              content = fs.readFileSync( "./views/message/start.handlebars");
              contentTemplate = handlebars.compile(content.toString());
              messageBody =  contentTemplate({ parcelInstance: updatedInstance });

              console.log("starting the message sending to let know the sender of the starting of the journey...");
              messageUtils.sendMessage(updatedInstance.sender , messageBody , function(data){
                console.log(data);
              });
            }
          }
        }

        //instance.updatedInstance = updatedInstance;
        return Promise.resolve(updatedInstance.status);

      })
      .then(function(updatedResultStatus){

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

      if(sanitizeBranchType(updatedInstance.exit_branch_type) == "sub" && sanitizeBranchType(updatedInstance.current_hub_type) == "regional"){

        updatedInstance.next_hub_type = sanitizeBranchType(updatedInstance.exit_branch_type);
        updatedInstance.next_hub = updatedInstance.exit_branch;

        instance.set('next_hub_type' , sanitizeBranchType(updatedInstance.exit_branch_type));
        instance.set("next_hub"  , updatedInstance.exit_branch);
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
});
