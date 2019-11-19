var DB = require("../models");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var subBranchModel = sequelize.models.subBranch;
var branchTransactionHistoryModel = sequelize.models.branchTransactionHistory;

var Promise = require("bluebird");
var moment = require("moment-timezone");

var timezoneConfig = require("./../config/timezone");
var branchUtils = require("./../utils/branch");
var branchTransactionLogic = require("./../logics/branchTransactionLogic");

var moduleSettings = require("./../config/moduleSettings");
var async = require("async");
var _lodash_ = require("lodash");

var TIME_STR = "06:00:00";

function removeAllHistoriesForBranch(branchInstance){

  whereQuery = {
    "branch_type": branchInstance.get("branchType"),
    "branch_id": branchInstance.get("id")
  };

  return branchTransactionHistoryModel.destroy({
    where: whereQuery
  });
}

function initiateForBranch(branchInstance, initializationDate, balance){

  var windowStart = initializationDate;
  var windowEnd = initializationDate.clone().add(1, 'days').subtract(1, 'second');

  var utcDateStart = windowStart.clone().tz(timezoneConfig.COMMON_ZONE);
  var utcDateEnd = windowEnd.clone().tz(timezoneConfig.COMMON_ZONE);

  console.log(utcDateStart.format("YYYY-MM-DD HH:mm:ss"));
  console.log(utcDateEnd.format("YYYY-MM-DD HH:mm:ss"));

  payload = {
    "branch_type": branchInstance.get("branchType"),
    "branch_id": branchInstance.get("id"),

    "date_start": utcDateStart.format("YYYY-MM-DD HH:mm:ss"),
    "date_end": utcDateEnd.format("YYYY-MM-DD HH:mm:ss"),

    "balance": balance,
    "closing_balance": balance
  };

  return branchTransactionHistoryModel.create(payload);
}

function populateSingleBranchForDate(branchInstance, paramDate){

  var utcDateStart = paramDate.clone().tz(timezoneConfig.COMMON_ZONE);

  var utcDateEnd = paramDate.clone()
                            .add(1, 'days')
                            .subtract(1, 'seconds')
                            .tz(timezoneConfig.COMMON_ZONE);

  var commonParams = {
    "datetime_range_start": utcDateStart.format("YYYY-MM-DD HH:mm:ss"),
    "datetime_range_end": utcDateEnd.format("YYYY-MM-DD HH:mm:ss")
  };

  return Promise.resolve(branchInstance)
  .then(function(branchInstance){

    params = _lodash_.extend({}, commonParams);
    params["branch_type"] = branchInstance.get("branchType");
    params["branch_id"] = branchInstance.get("id");

    return Promise.all([
      branchTransactionLogic.getBranchTransactionHistory(params),
      Promise.resolve(branchInstance)
    ]);
  })
  .then(function(complexResult){

    branchSummary = complexResult[0];
    branchInstance = complexResult[1]

    totalCashin = getTotalCashin(branchSummary);
    totalCashout = getTotalCashout(branchSummary);
    balance = totalCashin - totalCashout;

    whereQuery = {
      "branch_type": branchInstance.get("branchType"),
      "branch_id": branchInstance.get("id"),

      "date_start": utcDateStart.format("YYYY-MM-DD HH:mm:ss"),
      "date_end": utcDateEnd.format("YYYY-MM-DD HH:mm:ss"),
    };

    payload = _lodash_.extend({}, whereQuery);
    payload["balance"] = balance;

    return branchTransactionHistoryModel.findOrCreate({
      where: whereQuery,
      defaults: payload
    });
  })
  .then(function(complexResult){
    return Promise.resolve(true);
  })
  .catch(function(error){
    console.error(error.stack);
  });
}

function populateSingleBranchWithinDateRange(branchInstance, startDate, endDate){

  var datesBetweenWindow = generateDatesWithinRange(startDate, endDate);

  return Promise.mapSeries(datesBetweenWindow, function(currentDate, index, arrayLength){

    return populateSingleBranchForDate(branchInstance, currentDate);
  });
}

function getTotalCashin(branchSummary){

  total = 0;

  var cashinKeys = [
    "manual_cashin",
    "parcel_cashin",
    "vd_cashin",
    "money_cashin"
  ];

  for(I=0; I < cashinKeys.length; I++){

    key = cashinKeys[I];
    total += branchSummary[key];
  }

  return total;
}

function getTotalCashout(branchSummary){

  total = 0;

  var cashoutKeys = [
    "manual_cashout",
    "parcel_cashout",
    "vd_cashout",
    "money_cashout"
  ];

  for(I=0; I < cashoutKeys.length; I++){

    key = cashoutKeys[I];
    total += branchSummary[key];
  }
  return total;
}

function cumulativeAdjustmentForBranchWithinRange(branchInstance, startDate, endDate){

  var dates = generateDatesWithinRange(startDate, endDate);

  return Promise.resolve(branchInstance)
  .then(function(branchInstance){

    return Promise.mapSeries(dates, function(currentDate, index, arrayLength){

      var utcWindowStartDate = currentDate.clone().tz(timezoneConfig.COMMON_ZONE);

      var utcWindowEndDate =  currentDate.clone()
                                          .add(1, 'days')
                                          .subtract(1, 'seconds')
                                          .tz(timezoneConfig.COMMON_ZONE);
      var query = {
        "branch_type": branchInstance.get("branchType"),
        "branch_id": branchInstance.get("id"),
        "date_start": {
          "$gte": utcWindowStartDate.format("YYYY-MM-DD HH:mm:ss"),
        },
        "date_end": {
          "$lte": utcWindowEndDate.format("YYYY-MM-DD HH:mm:ss")
        }
      };

      return Promise.resolve(query);
    });
  })
  .then(function(queries){

    return Promise.resolve(queries)
    .map(function(query){

      return branchTransactionHistoryModel.findOne({
        where: query
      });
    });
  })
  .then(function(branchTransactionHistoryEntries){

    return Promise.mapSeries(branchTransactionHistoryEntries, function(branchTransactionHistoryEntry, index, length){
      if(index == 0){

      }else{
        branchTransactionHistoryEntry.set("closing_balance", branchTransactionHistoryEntry.get("balance") + branchTransactionHistoryEntries[index-1].get("closing_balance"));
      }
      return branchTransactionHistoryEntry.save();
    });
  })
  .map(function(results){
    return Promise.resolve(true);
  })
  .then(function(results){
    console.log("branch updated count: " + results.length);
  })
  .catch(function(err){
    console.error(err.stack);
  });
}

function generateDatesWithinRange(startDate, endDate){

  dates = [];

  for(currentDate = startDate.clone(); currentDate.isBefore(endDate); ){

    dates.push(currentDate);

    currentDate = currentDate.clone().add(1, 'days');
  }

  return dates;
};

function getTransactionHistoryEntry(query){

  return branchTransactionHistory.findOne(query);
}

function parseBranchAdjustments(){

  var adjustmentContainer = require("./fixtures/branch_adjustments.json");
  var adjustments = adjustmentContainer["main"];

  return Promise.map(adjustments, function(adjustment, index, arrayLength){

    var branchName = adjustment["Branch"];

    return Promise.all([
      subBranchModel.findOne({
        where:{
          label: branchName
        }
      }),
      Promise.resolve(adjustment),
      Promise.resolve(branchName)
    ]);
  })
  .map(function(complexResult){

    branchInstance = complexResult[0];

    if(!branchInstance){
      console.error("No branch found for: " + complexResult[2]);
      throw new Error("In correct branch " + complexResult[2]);
    }

    adjustment = complexResult[1];

    return Promise.all([
      removeAllHistoriesForBranch(branchInstance),
      Promise.resolve(branchInstance),
      Promise.resolve(adjustment)
    ]);

  })
  .map(function(complexResult){

    branchInstance = complexResult[1];
    adjustment = complexResult[2];

    var initializationDate = moment.tz(adjustment["Date"] + " " + TIME_STR, "MM/DD/YYYY HH:mm:ss", timezoneConfig.CLIENT_ZONE);

    var balance = Number(adjustment['ClosingBalance']);

    return Promise.all([
      initiateForBranch(branchInstance, initializationDate, balance),
      Promise.resolve(branchInstance),
      Promise.resolve(initializationDate)
    ]);
  })
  .map(function(complexResult){

    var branchInstance = complexResult[1];
    var initializationDate = complexResult[2];

    var nowDate = moment.tz(timezoneConfig.CLIENT_ZONE).clone().hours(initializationDate.hours())
                                                        .minutes(initializationDate.minutes())
                                                        .seconds(initializationDate.seconds());

    return populateSingleBranchWithinDateRange(branchInstance, initializationDate.clone().add(1, 'days'), nowDate)
    .then(function(results){
      cumulativeAdjustmentForBranchWithinRange(branchInstance, initializationDate, nowDate)
    });
  })
  .then(function(results){
    return results;
  })
  .catch(function(err){
    console.error(err);
    if(err){
      console.error(err.stack);
    }
  });
};

module.exports.parseBranchAdjustments = parseBranchAdjustments;
module.exports.getTransactionHistoryEntry = getTransactionHistoryEntry;
module.exports.generateDatesWithinRange = generateDatesWithinRange;
module.exports.cumulativeAdjustmentForBranchWithinRange = cumulativeAdjustmentForBranchWithinRange;
module.exports.getTotalCashin = getTotalCashin;
module.exports.getTotalCashout = getTotalCashout;
module.exports.populateSingleBranchWithinDateRange = populateSingleBranchWithinDateRange;
module.exports.populateSingleBranchForDate = populateSingleBranchForDate;
module.exports.initiateForBranch = initiateForBranch;
module.exports.removeAllHistoriesForBranch = removeAllHistoriesForBranch;
