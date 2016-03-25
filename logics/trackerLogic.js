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

  getTracker(trackerId , function(response){

    if(response.status == "success"){

      branchFetchFunc = null;
      if(response.data.currentBranchType == "sub"){
        branchFetchFunc = response.data.getSubBranch;
      }else if(response.data.currentBranchType == "regional"){
        branchFetchFunc = response.data.getRegionalBranch;
      }

      branchFetchFunc()
      .then(function(currentBranch){

          returnData = {
            currentBranch: {}
          };
          _.assignIn(returnData , response.data);
          _.assignIn(returnData.currentBranch , currentBranch);

          next({ status: "success" , data: returnData , message:null });
      })
      .catch(function(err){
          next({ status: "error" , data: null , message:err });
      });
    }
  });
}

exports.getTracker = getTracker;
exports.getTrackers = getTrackers;
