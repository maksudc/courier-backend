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

  var result = {
      "manual_cashin":0,
      "manual_cashout": 0
  };

  Promise.resolve(["cashin", "cashout"])
  .map(function(transactionType){

    params = Object.assign({}, req.query);
    params["transaction_type"] = transactionType;

    return getManualTransactionSummary(params);
  })
  .then(function(manualTransactionAmounts){

    result["manual_cashin"] = manualTransactionAmounts[0] || 0;
    result["manual_cashout"] = manualTransactionAmounts[1] || 0;

    res.status(HttpStatus.OK).send(result);
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

function getManualTransactionSummary(params){

  return getManualTransactionWhereQuery(params)
  .then(function(whereQuery){

    return manualTransactionModel.sum("amount", {
      where: whereQuery
    });
  });
}

function getManualTransactionWhereQuery(params){

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
