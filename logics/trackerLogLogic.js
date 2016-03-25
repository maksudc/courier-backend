var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var trackerLog = sequelize.models.trackerLog;

var getTrackerLogs = function(next){

  trackerLog
  .findAll()
  .then(function(results){
    next({ status:"success" , data:results , messgae:null });
  })
  .catch(function(err){
    next({ status:"error" , data:null , message:err });
  });
};

var getTrackerLogDetails = function(trackerLogUuid , next){

  trackerLog
  .findOne({ where: { uuid: trackerLogUuid } })
  .then(function(result){
    next({ status:"status" , data:result , message:null });
  }).catch(function(err){
    next({ status:"error" , data:null , message:err });
  });
};

var getTrackerLogsForTracker = function(trackerId , next){

  trackerLog
  .findAll({ where: { trackerId: trackerId }  })
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
