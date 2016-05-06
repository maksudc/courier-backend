var DB = require('../models/');
var sequelize = DB.sequelize;

var subBranch = sequelize.models.subBranch;
var regionalBranch = sequelize.models.regionalBranch;

var Promise = require("bluebird");

var sanitizeBranchType = function(branchType){

  if(branchType){
    return branchType.split("-")[0];
  }
  return null;
};

var desanitizeBranchType = function(branchType){

  if(branchType){
    stabilizedType = sanitizeBranchType(branchType);
    if(stabilizedType=="sub"){
      return "sub-branch";
    }else if(stabilizedType == "regional"){
      return "regional-branch";
    }
  }

  return null;
};

var getBranchInstance = function(branchType , branchId , next){

  var branchModel = null;

  if(branchType){

    stdBranchType = sanitizeBranchType(branchType);

    if(stdBranchType == "sub"){
      branchModel = subBranch;
    }else if(stdBranchType == "regional"){
      branchModel = regionalBranch;
    }
  }

  if(branchModel){

    return branchModel
    .findOne({ where: { id: branchId } })
    .then(function(branchInstance){

      if(next){
        next(branchInstance);
      }

      return Promise.resolve(branchInstance);
    });
  }

  return Promise.resolve(null);
};

exports.sanitizeBranchType = sanitizeBranchType;
exports.desanitizeBranchType = desanitizeBranchType;
exports.getBranchInstance = getBranchInstance;
