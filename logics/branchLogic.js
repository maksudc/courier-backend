var DB = require("../models");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var subBranch = sequelize.models.subBranch;
var regionalBranch = sequelize.models.regionalBranch;

var HttpStatus = require("http-status-codes");

var standardizeBranchType = function(branchType){

  if(branchType){
    return branchType.split("-")[0];
  }

  return null;
};

var getBranchModel = function(branchType){

    var branchModel = null;

    stdBranchType = standardizeBranchType(branchType);
    if(stdBranchType !== null){
       branchModel = (stdBranchType == "sub") ? subBranch : regionalBranch;
    }
    return branchModel;
};

var updateBranch = function(branchType , branchId , postData , next){

  var branchModel = getBranchModel(branchType);

  branchModel
  .update(postData , { where: { id: branchId } , individualHooks:true })
  .then(function(result){
    next({ status: "success" , statusCode: HttpStatus.OK , data:result , message:null });
  })
  .catch(function(err){
    next({ status: "error" , statusCode: HttpStatus.INTERNAL_SERVER_ERROR , data:null , message:JSON.stringify(err) });
  });

};

var getBranch = function(branchType , branchId , next){

  var branchModel = getBranchModel(branchType);
  branchModel
  .findOne({ where:{ id: branchId } })
  .then(function(branchItem){
    next({ status: "success" , statusCode: HttpStatus.OK , data:branchItem , message:null });
  })
  .catch(function(err){
    next({ status: "error" , statusCode: HttpStatus.INTERNAL_SERVER_ERROR , data:null , message:JSON.stringify(err) });
  });
};

var getBranches = function(branchType , params , next){

  var branchModel = getBranchModel(branchType);
  branchModel
  .findAll()
  .then(function(branchItems){
    next({ status: "success" , statusCode: HttpStatus.OK , data:branchItems , message:null });
  })
  .catch(function(err){
    next({ status: "error" , statusCode: HttpStatus.INTERNAL_SERVER_ERROR , data:null , message:JSON.stringify(err) });
  });
};

var deleteBranch = function(branchType , branchId , next){

  var branchModel = getBranchModel(branchType);
  branchModel
  .destroy({ where:{ id: branchId } , individualHooks:true })
  .then(function(result){
    next({ status:"success" , statusCode:HttpStatus.OK , data:result , message:null });
  })
  .catch(function(err){
    next({ status: "error" , statusCode: HttpStatus.INTERNAL_SERVER_ERROR , data:null , message:JSON.stringify(err) });
  });
};

exports.updateBranch = updateBranch;
exports.getBranchModel = getBranchModel;
exports.getBranches = getBranches;
exports.getBranch = getBranch;
exports.deleteBranch = deleteBranch;
exports.standardizeBranchType = standardizeBranchType;
