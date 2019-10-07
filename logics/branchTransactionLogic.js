var DB = require("./../models/index");
var manualTransactionModel = DB.sequelize.models.manualTransactions;
var orderModel = DB.sequelize.models.order;
var moneyModel = DB.sequelize.models.money;
var branchUtils = require("./../utils/branch");
var moment = require("moment-timezone");
var timezoneConfig = require("./../config/timezone");

function getBranchTransactionHistory(query){

  var result = {
      "manual_cashin": 0,
      "manual_cashout": 0,
      "parcel_cashin": 0,
      "parcel_cashout": 0,
      "vd_cashin": 0,
      "vd_cashout": 0,
      "money_cashin": 0,
      "money_cashout": 0
  };

  Promise.resolve(["cashin", "cashout"])
  .map(function(transactionType){

    params = Object.assign({}, query);
    params["transaction_type"] = transactionType;

    return getManualTransactionSummary(params);
  })
  .then(function(manualTransactionAmounts){
    result["manual_cashin"] = manualTransactionAmounts[0] || 0;
    result["manual_cashout"] = manualTransactionAmounts[1] || 0;
  })
  .then(function(){
    params = Object.assign({}, query);
    return getParcelCashin(params);
  })
  .then(function(totalParcelCashin){
    result["parcel_cashin"] = totalParcelCashin;
  })
  .then(function(){
    params = Object.assign({}, query);
    return getVDCashin(params);
  })
  .then(function(totalCashin){
    result["vd_cashin"] = totalCashin;
  })
  .then(function(){
    params = Object.assign({}, query);
    return getVDCashout(params);
  })
  .then(function(totalCashout){
    result["vd_cashout"] = totalCashout;
  })
  .then(function(){
    params = Object.assign({}, query);
    return getMoneyCashin(params);
  })
  .then(function(totalCashin){
    result["money_cashin"] = totalCashin;
  })
  .then(function(){
    params = Object.assign({}, query);
    return getMoneyCashout(params);
  })
  .then(function(totalCashout){
    result["money_cashout"] = totalCashout;
  })
  .then(function(){
    return Promise.resolve(result);
  });
}

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
        whereQuery["received_at"]["$gte"] = moment.tz(params.datetime_range_start, timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss");
      }

      if(params.datetime_range_end){
        whereQuery["received_at"]["$lte"] = moment.tz(params.datetime_range_end, timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss");
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

function getParcelCashin(params){

   return getParcelCashinWhereQuery(params)
  .then(function(whereQuery){
    return orderModel.sum('payment',{
      where: whereQuery
    });
  })
}

function getParcelCashinWhereQuery(params){

  var whereQuery = {
    "payment_status": "paid"
  };

  return Promise.resolve({})
  .then(function(){
    if(params){

      if(params.branch_type && params.branch_id){

        whereQuery["payment_hub_type"] = "sub";

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

      whereQuery["payment_hub"] = {
        "$in": subBranchIds
      };
    }
  })
  .then(function(){
    if(params.datetime_range_start || params.datetime_range_end){
      whereQuery["pay_time"] = {};

      if(params.datetime_range_start){
        whereQuery["pay_time"]["$gte"] = moment.tz(params.datetime_range_start, timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss");
      }

      if(params.datetime_range_end){
        whereQuery["pay_time"]["$lte"] = moment.tz(params.datetime_range_end, timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss");
      }

      if(params.datetime_range_start && params.datetime_range_end){
        whereQuery["pay_time"]["$between"] = [];
        whereQuery["pay_time"]["$between"].push(whereQuery["pay_time"]["$gte"]);
        whereQuery["pay_time"]["$between"].push(whereQuery["pay_time"]["$lte"]);

        delete whereQuery["pay_time"]["$gte"];
        delete whereQuery["pay_time"]["$lte"];
      }
    }
  })
  .then(function(){
    return whereQuery;
  });
}

function getVDCashin(params){

  var query = {};
  var summation = 0;

  return getVDCashinWhereQuery(params)
  .then(function(whereQuery){
    query = whereQuery;

    return moneyModel.sum("amount", {
      where: query
    });
  })
  .then(function(totalAmount){

    if(totalAmount){
      summation += totalAmount;
    }

    return moneyModel.sum("charge", {
      where: query
    });
  })
  .then(function(totalCharge){

    if(totalCharge){
      summation += totalCharge;
    }

    return Promise.resolve(summation);
  })
}

function getVDCashinWhereQuery(params){

  var whereQuery = {
    "type": "virtual_delivery",
    "paid": 1
  };

  return Promise.resolve({})
  .then(function(){
    if(params){

      if(params.branch_type && params.branch_id){

        if(params.branch_type == "sub" && params.branch_id){

          return branchUtils.getInclusiveBranchInstance("sub", params.branch_id)
          .then(function(subBranchInstance){
            whereQuery["source_regional_branch_id"] = subBranchInstance.regionalBranch.id;
            return Promise.resolve([subBranchInstance.id]);
          });

        }else if(params.branch_type == "regional" && params.branch_id){
          whereQuery["source_regional_branch_id"] = params.branch_id;
          return getSubBranchIdsUnderRegionalBranch(params.branch_id);
        }
      }
    }
  })
  .then(function(subBranchIds){

    if(subBranchIds){

      whereQuery["source_sub_branch_id"] = {
        "$in": subBranchIds
      };
    }
  })
  .then(function(){
    if(params.datetime_range_start || params.datetime_range_end){
      whereQuery["payment_time"] = {};

      if(params.datetime_range_start){
        whereQuery["payment_time"]["$gte"] = moment.tz(params.datetime_range_start, timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss");
      }

      if(params.datetime_range_end){
        whereQuery["payment_time"]["$lte"] = moment.tz(params.datetime_range_end, timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss");
      }

      if(params.datetime_range_start && params.datetime_range_end){
        whereQuery["payment_time"]["$between"] = [];
        whereQuery["payment_time"]["$between"].push(whereQuery["payment_time"]["$gte"]);
        whereQuery["payment_time"]["$between"].push(whereQuery["payment_time"]["$lte"]);

        delete whereQuery["payment_time"]["$gte"];
        delete whereQuery["payment_time"]["$lte"];
      }
    }
  })
  .then(function(){
    return whereQuery;
  });
}

function getVDCashout(params){

  return getVDCashoutWhereQuery(params)
  .then(function(whereQuery){
    return moneyModel.sum("amount", {
      where: whereQuery
    });
  });
}

function getVDCashoutWhereQuery(params){

  var whereQuery = {
    "type": "virtual_delivery",
    "paid": 1,
    "status": "delivered"
  };

  return Promise.resolve({})
  .then(function(){
    if(params){

      if(params.branch_type && params.branch_id){

        if(params.branch_type == "sub" && params.branch_id){

          return branchUtils.getInclusiveBranchInstance("sub", params.branch_id)
          .then(function(subBranchInstance){
            whereQuery["regional_branch_id"] = subBranchInstance.regionalBranch.id;
            return Promise.resolve([subBranchInstance.id]);
          });

        }else if(params.branch_type == "regional" && params.branch_id){
          whereQuery["regional_branch_id"] = params.branch_id;
          return getSubBranchIdsUnderRegionalBranch(params.branch_id);
        }
      }
    }
  })
  .then(function(subBranchIds){

    if(subBranchIds){

      whereQuery["sub_branch_id"] = {
        "$in": subBranchIds
      };
    }
  })
  .then(function(){
    if(params.datetime_range_start || params.datetime_range_end){
      whereQuery["delivery_time"] = {};

      if(params.datetime_range_start){
        whereQuery["delivery_time"]["$gte"] = moment.tz(params.datetime_range_start, timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss");
      }

      if(params.datetime_range_end){
        whereQuery["delivery_time"]["$lte"] = moment.tz(params.datetime_range_end, timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss");
      }

      if(params.datetime_range_start && params.datetime_range_end){
        whereQuery["delivery_time"]["$between"] = [];
        whereQuery["delivery_time"]["$between"].push(whereQuery["delivery_time"]["$gte"]);
        whereQuery["delivery_time"]["$between"].push(whereQuery["delivery_time"]["$lte"]);

        delete whereQuery["delivery_time"]["$gte"];
        delete whereQuery["delivery_time"]["$lte"];
      }
    }
  })
  .then(function(){
    return whereQuery;
  });
}

function getMoneyCashin(params){

  return getMoneyCashinWhereQuery(params)
  .then(function(whereQuery){
    return moneyModel.sum("payable", {
      where: whereQuery
    });
  });
}

function getMoneyCashinWhereQuery(params){

  var whereQuery = {
    "type": "general",
    "paid": 1
  };

  return Promise.resolve({})
  .then(function(){
    if(params){

      if(params.branch_type && params.branch_id){

        if(params.branch_type == "sub" && params.branch_id){

          return branchUtils.getInclusiveBranchInstance("sub", params.branch_id)
          .then(function(subBranchInstance){
            whereQuery["source_regional_branch_id"] = subBranchInstance.regionalBranch.id;
            return Promise.resolve([subBranchInstance.id]);
          });

          return Promise.resolve([params.branch_id]);

        }else if(params.branch_type == "regional" && params.branch_id){
          whereQuery["source_regional_branch_id"] = params.branch_id;
          return getSubBranchIdsUnderRegionalBranch(params.branch_id);
        }
      }
    }
  })
  .then(function(subBranchIds){

    if(subBranchIds){

      whereQuery["source_sub_branch_id"] = {
        "$in": subBranchIds
      };
    }
  })
  .then(function(){
    if(params.datetime_range_start || params.datetime_range_end){
      whereQuery["payment_time"] = {};

      if(params.datetime_range_start){
        whereQuery["payment_time"]["$gte"] = moment.tz(params.datetime_range_start, timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss");
      }

      if(params.datetime_range_end){
        whereQuery["payment_time"]["$lte"] = moment.tz(params.datetime_range_end, timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss");
      }

      if(params.datetime_range_start && params.datetime_range_end){
        whereQuery["payment_time"]["$between"] = [];
        whereQuery["payment_time"]["$between"].push(whereQuery["payment_time"]["$gte"]);
        whereQuery["payment_time"]["$between"].push(whereQuery["payment_time"]["$lte"]);

        delete whereQuery["payment_time"]["$gte"];
        delete whereQuery["payment_time"]["$lte"];
      }
    }
  })
  .then(function(){
    return whereQuery;
  });
}

function getMoneyCashout(params){

  return getMoneyCashoutWhereQuery(params)
  .then(function(whereQuery){
    return moneyModel.sum("amount", {
      where: whereQuery
    });
  });
}

function getMoneyCashoutWhereQuery(params){

  var whereQuery = {
    "type": "general",
    "paid": 1,
    "status": "delivered"
  };

  return Promise.resolve({})
  .then(function(){
    if(params){

      if(params.branch_type && params.branch_id){

        if(params.branch_type == "sub" && params.branch_id){

          return branchUtils.getInclusiveBranchInstance("sub", params.branch_id)
          .then(function(subBranchInstance){
            whereQuery["regional_branch_id"] = subBranchInstance.regionalBranch.id;
            return Promise.resolve([subBranchInstance.id]);
          });

        }else if(params.branch_type == "regional" && params.branch_id){
          whereQuery["regional_branch_id"] = params.branch_id;
          return getSubBranchIdsUnderRegionalBranch(params.branch_id);
        }
      }
    }
  })
  .then(function(subBranchIds){

    if(subBranchIds){

      whereQuery["sub_branch_id"] = {
        "$in": subBranchIds
      };
    }
  })
  .then(function(){
    if(params.datetime_range_start || params.datetime_range_end){
      whereQuery["delivery_time"] = {};

      if(params.datetime_range_start){
        whereQuery["delivery_time"]["$gte"] = moment.tz(params.datetime_range_start, timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss");
      }

      if(params.datetime_range_end){
        whereQuery["delivery_time"]["$lte"] = moment.tz(params.datetime_range_end, timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss");
      }

      if(params.datetime_range_start && params.datetime_range_end){
        whereQuery["delivery_time"]["$between"] = [];
        whereQuery["delivery_time"]["$between"].push(whereQuery["delivery_time"]["$gte"]);
        whereQuery["delivery_time"]["$between"].push(whereQuery["delivery_time"]["$lte"]);

        delete whereQuery["delivery_time"]["$gte"];
        delete whereQuery["delivery_time"]["$lte"];
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

module.exports.getBranchTransactionHistory = getBranchTransactionHistory;
module.exports.getManualTransactionSummary = getManualTransactionSummary;
module.exports.getManualTransactionWhereQuery = getManualTransactionWhereQuery;
module.exports.getParcelCashin = getParcelCashin;
module.exports.getParcelCashinWhereQuery = getParcelCashinWhereQuery;
module.exports.getVDCashin = getVDCashin;
module.exports.getVDCashinWhereQuery = getVDCashinWhereQuery;
module.exports.getVDCashout = getVDCashout;
module.exports.getVDCashoutWhereQuery = getVDCashoutWhereQuery;
module.exports.getMoneyCashin = getMoneyCashin;
module.exports.getMoneyCashinWhereQuery = getMoneyCashinWhereQuery;
module.exports.getMoneyCashout = getMoneyCashout;
module.exports.getMoneyCashoutWhereQuery = getMoneyCashoutWhereQuery;
module.exports.getSubBranchIdsUnderRegionalBranch = getSubBranchIdsUnderRegionalBranch;
