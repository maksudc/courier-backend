var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var genericTracker = sequelize.models.genericTracker;
var _= require('lodash');

var getTracker = function(trackerId , next){

  genericTracker
  .findOne({ where: { uuid: trackerId } })
  .then(function(result){
    next({ status: "success" , data:result , message:null });
  })
  .catch(function(err){
    next({ status:"error" , data:null , message: err });
  });
};

var getTrackers = function(next){

  genericTracker
  .findAll()
  .then(function(results){
    next({ status:"success" , data:results , message:null });
  })
  .catch(function(err){
    next({ status:"error" , data:null , message: err });
  });
};

var getTrackerCurrentBranch = function(trackerId , next){

  genericTracker
  .findOne({ where: { uuid: trackerId } })
  .then(function(result){
    //next({ status: "success" , data:result , message:null });
    if(result.currentBranchType == "sub"){

      result
      .getSubBranch()
      .then(function(subBranch){
        next({ status:"success" , data: subBranch , message:null });
      })
      .catch(function(err){
        next({ status:"error" , data:null , message:err });
      });

    }else if(result.currentBranchType == "regional"){

      result
      .getRegionalBranch()
      .then(function(regionalBranch){
        next({ status:"success" , data: regionalBranch , message:null });
      })
      .catch(function(err){
        next({ status:"error" , data:null , message:err });
      });
    }
  })
  .catch(function(err){
    next({ status:"error" , data:null , message: err });
  });
};

var updateCurrentLocation = function(trackerId , branchType , branchId , next){

  genericTracker
  .update(
    { currentBranchType:branchType , currentBranchId:branchId } ,
    { where:{ uuid:trackerId } }
  )
  .then(function(numRowsAffected){
    next({ status:"success" , data:numRowsAffected , message:null });
  })
  .catch(function(err){
    next({ status:"error" , data:null , message:err });
  });
};




exports.getTracker = getTracker;
exports.getTrackers = getTrackers;
exports.getTrackerCurrentBranch = getTrackerCurrentBranch;
exports.updateCurrentLocation = updateCurrentLocation;
