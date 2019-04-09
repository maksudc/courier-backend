var express = require("express");
var router = express.Router();
var HttpStatus = require("http-status-codes");
var DB = require("./../../../models/index");
var cashinModel = DB.sequelize.models.manualTransactions;
var DataTableHelper = require("./../../../utils/data_binder/dataTable");
var panicUtils = require("./../../../utils/panic");
var Promise = require("bluebird");
var branchUtils = require("./../../../utils/branch");
var moment = require("moment-timezone");
var timezoneConfig = require("./../../../config/timezone");
var _ = require("underscore");

router.get("/", async function(req, res){

  var resp = {};

  getWhereQuery()
  .then(function(whereQuery){

    return manualTransactions.sum("amount", {
      where: whereQuery
    });
  })
  .then(function(totalAmount){
    res.status(HttpStatus.OK);
  });
});

function getWhereQuery(params){

  var whereQuery = {};

  var branchPromise = Promise.resolve({});

  if(params.branchType == "sub" && params.branchId){
    whereQuery["branch_type"] = params.branchType ;
    whereQuery["branchId"] = params.branchId;

  }else if(params.branchType == "regional" && params.branchId){
    whereQuery["branchType"] = "sub";

    branchPromise = branchUtils.getSubBranchesUnderRegionalBranch(params.branchId, { attributes: ["id"] })
    .map(function(subBranchInstance){
      return subBranchInstance.get("id");
    })
    .then(function(subBranchIds){

      whereQuery["branchId"] = {
        "$in": subBranchIds
      };
    });
  }

  return branchPromise
  .then(function(){

  })
  .then(function(){
    return whereQuery;
  });
}


module.exports = router;
