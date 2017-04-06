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

var getInclusiveBranchInstance = function(branchType , branchId , next){

  return getBranchInstance(branchType , branchId , null)
  .then(function(branchItem){
    if( branchItem && branchItem.branchType == 'sub'){
      return branchItem
            .getRegionalBranch()
            .then(function(parentBranchItem){
                branchItem.regionalBranch = parentBranchItem;
                branchItem.dataValues.regionalBranch = parentBranchItem;
                return Promise.resolve(branchItem);
            });
    }
    return Promise.resolve(branchItem);

  })
  .then(function(finalBranchItem){

    if(next){
      next(finalBranchItem);
    }

    return Promise.resolve(finalBranchItem);
  });
};

var prepareLabel = function(aBranchData){
  data = "";

  if(!aBranchData) return null;
  if(!aBranchData.label) return null;

  data = aBranchData.label;
  if(aBranchData.regionalBranch && aBranchData.regionalBranch.label){
    data = data + "," +aBranchData.regionalBranch.label;
  }
  return data;
};

exports.sanitizeBranchType = sanitizeBranchType;
exports.desanitizeBranchType = desanitizeBranchType;
exports.getBranchInstance = getBranchInstance;
exports.getInclusiveBranchInstance = getInclusiveBranchInstance;
exports.prepareLabel = prepareLabel;
