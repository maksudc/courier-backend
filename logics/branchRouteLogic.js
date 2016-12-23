var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var RouteModel = sequelize.models.branchRoute;
var RegionalBranchModel = sequelize.models.regionalBranch;
var SubBranchModel = sequelize.models.subBranch;
var HttpStatus = require("http-status-codes");
var commonUtils = require("./utils/common");

var _ = require("lodash");

var Promise = require("bluebird");

var getDefinedRoutes = function(next){

  var routeResult = null;

  RouteModel
  .findAll({ order: "sourceId ASC" })
  .then(function(routeItems){
    next({ status: "success" , statusCode: HttpStatus.OK , message:null , data:routeItems });
  })
  .catch(function(err){
    message = commonUtils.getErrorMessage(err);
    next({ status: "error" , statusCode: HttpStatus.INTERNAL_SERVER_ERROR , message: message , data:null });
  });
};

var getFullRouteBetweenSubBranches = function(sourceSubBranchId , destinationSubBranchId , next){

    /*Promise.map([ sourceSubBranchId , destinationSubBranchId ] , function(currentSubBranchId){

        return
        SubBranchModel
        .findOne({where:{ id: currentSubBranchId }})
        .catch(function(err){
            console.log(err);
        })
    })  */

    var sourceSubBranchItem = null;
    var destinationSubBranchItem = null;

     var p1 = SubBranchModel
    .findOne({where:{ id: sourceSubBranchId }});
    /*.then(function(resultSourceSubBranchItem){

        sourceSubBranchItem = resultSourceSubBranchItem;
        console.log(resultSourceSubBranchItem.id);

        return Promise.resolve(resultSourceSubBranchItem);
    });*/

    var p2 =

    SubBranchModel
    .findOne({ where:{ id: destinationSubBranchId } });

    /*.then(function(resultDestinationSubBranchItem){

            console.log(resultDestinationSubBranchItem);
            //console.log(sourceSubBranchItem);
            destinationSubBranchItem = resultDestinationSubBranchItem;
    });*/



    Promise.all([p1 , p2]).then(function(results){

        console.log(results[0].regionalBranchId);
        console.log(results[1].regionalBranchId);

        RouteModel.findOne({
            where: {

                sourceId: results[0].regionalBranchId,
                destinationId: results[1].regionalBranchId,
            }
        })
        .then(function(routeItem){

            console.log(" Found Route Item ");
            //console.log(routeItem);

            if(routeItem){

                midNodes = routeItem.midNodes;

                console.log(" MidNodes ");
                if(midNodes){

                    midNodes = JSON.parse(midNodes);
                }
                //console.log(midNodes);

                return Promise.resolve(midNodes);
            }

            return ;
        })
        .then(function(midNodeIds){

            console.log("Working on a single Midnode");
            console.log(midNodeIds);

            promises = [];
            for(I = 0 ; I< midNodeIds.length ; I++){

                p = RegionalBranchModel.findOne({ where: { id: midNodeIds[I] } });
                promises.push(p);
            }

            Promise.all(promises)
            .then(function(midNodesExpanded){

                console.log(" Almost complete  ");
                //console.log(midNodesExpanded);

                next(midNodesExpanded);
            });
        })
        .catch(function(err){

            if(err){
                next({ "status":"error" , "data":null ,"message":JSON.stringify(err) });
                return;
            }
        });
    });
 /*   .spread(function(sourceRegionalBranchId , destinationRegionalBranchId){


        return
        RouteModel.findOne({
            where: {

                sourceId: sourceRegionalBranchId,
                destinationId: destinationSubBranchId,
            }
        })
    })*/
};

var getRouteBetween = function(sourceBranchType , sourceBranchId , destinationBranchType , destinationBranchId ,next){

  /*if(sourceBranchType == 'sub' && destinationBranchType=='sub'){
    getFullRouteBetween(sourceBranchId , destinationBranchId , next);
    return;
  }*/
  console.log(sourceBranchType);
  console.log(destinationBranchType);
  var p1 = Promise.resolve(null);
  var p2 = Promise.resolve(null);

  if(sourceBranchType == "sub"){
    p1 = SubBranchModel.findOne({ where: { id: sourceBranchId } });
  }
  if(destinationBranchType == "sub"){
    p2 = SubBranchModel.findOne({ where: { id: destinationBranchId } });
  }

  var sourceRegionalBranchId = null;
  var destinationRegionalBranchId = null;

  return Promise
  .all([p1 , p2])
  .then(function(results){

    sourceSubBranchItem = null;
    destinationSubBranchItem = null;

    //console.log("partial queries results are: "+ JSON.stringify(results));
    if(results.length > 0 && results[0] !== null){
        sourceSubBranchItem = results[0];
    }
    if(results.length > 1 && results[1] !== null){
        destinationSubBranchItem = results[1];
    }

    if(sourceSubBranchItem){
      sourceRegionalBranchId = sourceSubBranchItem.regionalBranchId;
    }else{
      sourceRegionalBranchId = sourceBranchId;
    }

    if(destinationSubBranchItem){
      destinationRegionalBranchId = destinationSubBranchItem.regionalBranchId;
    }else{
      destinationRegionalBranchId = destinationBranchId;
    }

    console.log("Source Regional Branch Id: " + sourceRegionalBranchId);
    console.log("Destination Regional Branch Id: " + destinationRegionalBranchId);

    return RouteModel.findOne({
        where: {

            sourceId: sourceRegionalBranchId,
            destinationId: destinationRegionalBranchId,
        }
    });
  })
  .then(function(routeItem){

      if(routeItem){

        console.log(" Found Route Item ");
        console.log(routeItem.id);

          var midNodes = [];

          //console.log(" MidNodes ");
          if(routeItem.midNodes){
              midNodes = JSON.parse(routeItem.midNodes);
          }
          console.log(midNodes);

          // Check whether it is a direct route or not
          if(midNodes.length == 1){

            interimMidNode  = midNodes[0];
            if(interimMidNode === null){
              midNodes = [];
            }
          }

          midNodes = [sourceRegionalBranchId].concat(midNodes);
          midNodes.push(destinationRegionalBranchId);

          return midNodes;
      }else{

        if(sourceRegionalBranchId == destinationRegionalBranchId){
          return [sourceRegionalBranchId , destinationRegionalBranchId];
        }
      }

      return Promise.reject("No route defined");
  })
  .map(function(midNodeId){

      console.log("Working on a single Midnode");
      console.log(midNodeId);

      return RegionalBranchModel.findOne({ where: { id: midNodeId } });
  })
  .then(function(midNodesExpanded){

      console.log(" Almost complete  ");
      //console.log(midNodesExpanded);
      console.log("Expanded mid nodes number: " + midNodesExpanded.length);

      //next(midNodesExpanded);
      if(next){
        return next({ status: "success" , statusCode: HttpStatus.OK , message:null , data:midNodesExpanded  });
      }else{
        return midNodesExpanded;
      }
  })
  .catch(function(err){

    if(next){
      return next({ status: "error" , statusCode: HttpStatus.INTERNAL_SERVER_ERROR , message:commonUtils.getErrorMessage(err) , data:null  });
    }else{
      return Promise.reject(commonUtils.getErrorMessage(err));
    }
  });
};

var newRoute = function(postData , next){

  var sourceId = postData.sourceId;
  var destinationId = postData.destinationId;

  console.log(postData);

  if(!sourceId || !destinationId || !postData.midNodes){

    next({ status:"error" , data:null , message:"Bad paramter" , params:postData });
    return;
  }

  var midNodes  = JSON.parse(postData.midNodes);
  var reverseMidNodes = JSON.parse(postData.midNodes).reverse();

  var routeData = {};
  var reverseRouteData = {};

  routeData.sourceId = sourceId;
  routeData.destinationId = destinationId;

  reverseRouteData.sourceId = destinationId;
  reverseRouteData.destinationId = sourceId;

  var forwardRoutePromise = RouteModel
  .findOne({ where: { sourceId:sourceId , destinationId:destinationId } })
  .then(function(result){
    if(result){
      return  result.destroy();
    }
  })
  .then(function(result){

    if(midNodes){

      forwardtmpNodes = [];
      for(I = 0 ;I < midNodes.length ; I++){
        forwardtmpNodes.push(parseInt(midNodes[I]));
      }
      _.assignIn(routeData , { 'midNodes': JSON.stringify(forwardtmpNodes)  });
    }
    return RouteModel.create(routeData);
  });

  // by default the reverse route will be true
  // unless turned off by parameter
  if(postData.reverse===null || postData.reverse===undefined){
    postData.reverse = "true";
  }

  if(postData.reverse=="false" || postData.reverse ===false){
      // Only forward way
      forwardRoutePromise
      .then(function(result){
          next({ status:"success" , data:result , message:null });
          return;
      })
      .catch(function(err){
        console.error(err);
        next({ status:"error" , data:null , message:err });
        return;
      });
  }else{
    // both forward and backward route has to be defined

    var backwardRoutePromise = RouteModel
    .findOne({ where: { sourceId:destinationId , destinationId:sourceId } })
    .then(function(result){
      if(result){
        return  result.destroy();
      }
    })
    .then(function(result){

      if(reverseMidNodes){

        backwardtmpNodes = [];
        for(I = 0 ;I < reverseMidNodes.length ; I++){
          backwardtmpNodes.push(parseInt(reverseMidNodes[I]));
        }
        _.assignIn(reverseRouteData , { 'midNodes': JSON.stringify(backwardtmpNodes)  });
      }
      return RouteModel.create(reverseRouteData);
    });

    Promise.all([forwardRoutePromise , backwardRoutePromise])
    .then(function(results){
        next({ status:"success" , data:results[0] , message:null });
        return;
    })
    .catch(function(err){
      console.error(err);
      next({ status:"error" , data:null , message:err });
      return;
    });
  }
};

exports.getFullRouteBetween = getFullRouteBetweenSubBranches;
exports.newRoute = newRoute;
exports.getRouteBetween = getRouteBetween;
exports.getDefinedRoutes = getDefinedRoutes;
