var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var trackerLog = sequelize.models.trackerLog;
var order = sequelize.models.order;
var shipment = sequelize.models.shipment;

var Promise = require("bluebird");
var _ = require("lodash");

var HttpStatus = require("http-status-codes");
var branchUtils = require('../utils/branch');


function extractParams(params){

  var options = {};
  if(params.includeBranch){
    if(params.includeBranch == 1){
      options.includeBranch = 1;
    }
  }

  return options;
}

var getTrackerLogs = function(params , next){

  console.log(params);

  trackerLog
  .findAll()
  .map(function(result){

    if(params.includeBranch == 1){

        return result
        .getBranch()
        .then(function(resultBranch){

          extendedData = {};
          _.assignIn(extendedData , result.dataValues);
          if(resultBranch){
            _.assignIn(extendedData , { branch: resultBranch });
          }
          return Promise.resolve(extendedData);
        });
    }

    return Promise.resolve(result);
  })
  .then(function(results){
    next({ status:"success" , data:results , messgae:null });
  })
  .catch(function(err){
    console.log(err);
    next({ status:"error" , data:null , message:err });
  });
};

var getTrackerLogDetails = function(trackerLogUuid , params, next){

  trackerLog
  .findOne({ where: { uuid: trackerLogUuid } })
  .then(function(result){
    if(params.includeBranch == 1){

        return result
        .getBranch()
        .then(function(resultBranch){

          extendedData = {};
          _.assignIn(extendedData , result.dataValues);
          if(resultBranch){
            _.assignIn(extendedData , { branch: resultBranch });
          }
          return Promise.resolve(extendedData);
        });
    }

    return Promise.resolve(result);
  })
  .then(function(result){

    next({ status:"status" , data:result , message:null });
  })
  .catch(function(err){
    next({ status:"error" , data:null , message:err });
  });
};

var getTrackerLogsForOrder  = function(params , next){

  if(!params.bar_code){
    next({ status: "error" , statusCode: HttpStatus.BAD_REQUEST , message:"tracker Id not found" , data:null });
    return Promise.resolve(null);
  }

  var whereQuery = {};
  if(params.bar_code){
    whereQuery.bar_code = params.bar_code;
  }

  console.log(params);

  order
  .findOne({ where: whereQuery })
  .then(function(orderInstance){

      if(!orderInstance){
        next({status: "error" , statusCode: HttpStatus.NOT_FOUND , message: "Order not found" , data:null });
        return Promise.resolve(null);
      }
      return orderInstance.getTracker();
  })
  .then(function(trackerInstance){
    return trackerInstance.getLogs({ order: "eventDateTime" });
  })
  .then(function(trackerLogInstances){

    if(params.includeBranch == "true"){

      return Promise.map(trackerLogInstances , function(trackerLogInstance){

          return branchUtils
                .getBranchInstance(trackerLogInstance.branchType , trackerLogInstance.branchId , null)
                .then(function(branchInstance){

                  trackerLogInstance.dataValues.branch = branchInstance;
                  trackerLogInstance.branch = branchInstance;

                  return Promise.resolve(trackerLogInstance);
                });
        });
    }

    return Promise.resolve(trackerLogInstances);
  })
  .then(function(trackerLogInstances){

    next({ status: "success" , statusCode:HttpStatus.OK , message: null , data: trackerLogInstances });
    return Promise.resolve(trackerLogInstances);
  })
  .catch(function(err){

    if(err){
      console.log(err);
      next({ status: "error" , statusCode: HttpStatus.INTERNAL_SERVER_ERROR , message: err , data: null });
    }
  });

};

var getTrackerLogsForTracker = function(trackerId , params , next){

  trackerLog
  .findAll({ where: { trackerId: trackerId }  })
  .then(function(results){
    if(params.includeBranch == 1){

      return Promise.map(results , function(result){

        return result
        .getBranch()
        .then(function(resultBranch){

          extendedData = {};
          _.assignIn(extendedData , result.dataValues);
          if(resultBranch){
            _.assignIn(extendedData , { branch: resultBranch });
          }
          return Promise.resolve(extendedData);
        });
      });
    }

    return Promise.resolve(results);
  })
  .then(function(results){
    next({ status:"success" , data:results , message:null });
  })
  .catch(function(err){
    next({ status:"error" , data:null , message:err });
  });
};

/**
  * get logs for a branch .
  * which branch ( branchType , branchId ) has logs for today or yesterday
  * Total number of rasnportation
  * Heatmap for the overall transportation network
  * The data is equally important for notification to the branch manager as well as the reporting toolset
**/
//var getTrackerLogsForBranch = function(){}

/**
  @// TODO:  Insert the trackerLog
  @// TODO:  Update the trackerLog
  @// TODO:  Delete the trackerLog
**/

exports.getTrackerLogs = getTrackerLogs;
exports.getTrackerLogDetails = getTrackerLogDetails;
exports.getTrackerLogsForTracker = getTrackerLogsForTracker;
exports.getTrackerLogsForOrder = getTrackerLogsForOrder;
