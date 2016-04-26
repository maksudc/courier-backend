var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var trackerLog = sequelize.models.trackerLog;
var order = sequelize.models.order;
var shipment = sequelize.models.shipment;

var Promise = require("bluebird");
var _ = require("lodash");

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
