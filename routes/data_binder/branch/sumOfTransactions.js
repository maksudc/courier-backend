var express = require("express");
var router = express.Router();
var HttpStatus = require("http-status-codes");
var DB = require("./../../../models/index");
var manualTransactionModel = DB.sequelize.models.manualTransactions;
var panicUtils = require("./../../../utils/panic");
var Promise = require("bluebird");
var branchUtils = require("./../../../utils/branch");
var moment = require("moment-timezone");
var timezoneConfig = require("./../../../config/timezone");
var _ = require("underscore");

router.get("/", function(req, res){

  getWhereQuery(req.query)
  .then(function(whereQuery){

    return manualTransactionModel.sum("amount", {
      where: whereQuery
    });
  })
  .then(function(totalAmount){
    res.status(HttpStatus.OK).send({
      "sum": totalAmount
    });
  })
  .catch(function(err){
    errorMessage = "";
    if(err){
      console.error(err.stack);
      errorMessage = err.message;
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      "error": errorMessage
    });
  });
});

function getWhereQuery(params){

  var whereQuery = {};

  return Promise.resolve({})
  .then(function(){
    if(params){

      if(params.transaction_type){
        whereQuery["transaction_type"] = params.transaction_type;
      }

      if(params.branch_type && params.branch_id){

        whereQuery["branch_type"] = "sub";
        if(params.branch_type == "sub" && params.branch_id){
          return Promise.resolve([params.branch_id]);

        }else if(params.branch_type == "regional" && params.branch_id){

          return getSubBranchIdsUnderRegionalBranch(params.branch_id);
        }
      }
    }
  })
  .then(function(subBranchIds){

    if(subBranchIds){

      whereQuery["branch_id"] = {
        "$in": subBranchIds
      };
    }
  })
  .then(function(){
    if(params.datetime_range_start || params.datetime_range_end){
      whereQuery["received_at"] = {};

      if(params.datetime_range_start){
        whereQuery["received_at"]["$gte"] = moment.tz(params.datetime_range_start, timezoneConfig.CLIENT_ZONE).tz(timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss");
      }

      if(params.datetime_range_end){
        whereQuery["received_at"]["$lte"] = moment.tz(params.datetime_range_end, timezoneConfig.CLIENT_ZONE).tz(timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss");
      }

      if(params.datetime_range_start && params.datetime_range_end){
        whereQuery["received_at"]["$between"] = [];
        whereQuery["received_at"]["$between"].push(whereQuery["received_at"]["$gte"]);
        whereQuery["received_at"]["$between"].push(whereQuery["received_at"]["$lte"]);

        delete whereQuery["received_at"]["$gte"];
        delete whereQuery["received_at"]["$lte"];
      }
    }
  })
  .then(function(){
    return whereQuery;
  });
}

var getSubBranchIdsUnderRegionalBranch = function(regionalBranchId){

  return branchUtils
  .getSubBranchesUnderRegionalBranch(regionalBranchId, { attributes: ["id"] })
  .map(function(subBranchInstance){
    return subBranchInstance.get("id");
  });
}


module.exports = router;
