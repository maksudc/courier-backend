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

var populateForDate = function(dayStr){

  dayStartTimeStr = dayStr + " 06:00:00";
  utcDateStart = moment.tz(dayStartTimeStr, timezoneConfig.CLIENT_ZONE)
                  .tz(timezoneConfig.COMMON_ZONE);

  utcDateEnd = moment.tz(dayStartTimeStr, timezoneConfig.CLIENT_ZONE)
                .add(1, 'days')
                .subtract(1, 'seconds')
                .tz(timezoneConfig.COMMON_ZONE);

  var commonParams = {
    "datetime_range_start": utcDateStart.format("YYYY-MM-DD HH:mm:ss"),
    "datetime_range_end": utcDateEnd.format("YYYY-MM-DD HH:mm:ss")
  };

  // return sequelize.transaction(function(t){
  var t = null;

    return subBranchModel.findAll({
      transaction: t
    })
    .map(function(branchInstance){

      params = Object.assign({}, commonParams);
      params["branch_type"] = branchInstance.get("branchType");
      params["branch_id"] = branchInstance.get("id");

      return Promise.all([
        branchTransactionLogic.getBranchTransactionHistory(params),
        Promise.resolve(branchInstance)
      ]);
    })
    .map(function(complexResult){

      branchSummary = complexResult[0];
      branchInstance = complexResult[1]

      totalCashin = getTotalCashin(branchSummary);
      totalCashout = getTotalCashout(branchSummary);
      balance = totalCashin - totalCashout;

      whereQuery = {
        "branch_type": branchInstance.get("branchType"),
        "branch_id": branchInstance.get("id"),

        "date_start": commonParams["datetime_range_start"],
        "date_end": commonParams["datetime_range_end"],
      };

      payload = Object.assign({}, whereQuery);
      payload["balance"] = balance;

      return branchTransactionHistoryModel.findOrCreate({
        where: whereQuery,
        defaults: payload,
        transaction: t
      });
    })
    .map(function(complexResult){
      return Promise.resolve(true);
    }) //;
  // })
  .then(function(result){
    console.log("Successfully inserted"+ result.length +" rows");
  })
  .catch(function(error){
    console.error(error.stack);
  });
};

function getTotalCashin(branchSummary){

  total = 0;

  var cashinKeys = [
    "manual_cashin",
    "parcel_cashin",
    "vd_cashin",
    "money_cashin"
  ];

  for(let I=0; I < cashinKeys.length; I++){

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

  for(let I=0; I < cashoutKeys.length; I++){

    key = cashoutKeys[I];
    total += branchSummary[key];
  }
  return total;
}

//@TODO: Populate dates from cutoff date to today
//@TODO: Calculate closing_balance

var populateFromStart = function(){

  startDayStr = moduleSettings.BRANCH_SUMMARY_START_DATE;
  startTimeStr = " 00:00:00";

  startDate = moment.tz(startDayStr + startTimeStr, timezoneConfig.CLIENT_ZONE);
  endDate = moment.tz(timezoneConfig.CLIENT_ZONE).hours(0).minutes(0).seconds(0);

  dates = generateDatesWithinRange(startDate, endDate);

  return Promise.all(dates)
  .map(function(currentDayStr){

    return populateForDate(currentDayStr);
  })
  .then(function(res){
    console.log("Generated");
  })
  .catch(function(err){
    console.error(err.stack);
  });
};

var adjustClosingBalanceWithinRange = function(startDate, endDate){

  var dates = generateDatesWithinRange(startDate, endDate);

  return subBranchModel.findAll()
  .map(function(branchInstance){

    return Promise.mapSeries(dates, function(dayStr, index, arrayLength){

      dateTimeStr = dayStr + " 06:00:00";

      var utcWindowStartDate = moment.tz(dateTimeStr, timezoneConfig.CLIENT_ZONE)
                      .tz(timezoneConfig.COMMON_ZONE);

      var utcWindowEndDate =  moment.tz(dateTimeStr, timezoneConfig.CLIENT_ZONE)
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
  .map(function(queries){

    return Promise.resolve(queries)
    .map(function(query){

      return branchTransactionHistoryModel.findOne({
        where: query
      });
    });
  })
  .map(function(branchTransactionHistoryEntries){

    return Promise.mapSeries(branchTransactionHistoryEntries, function(branchTransactionHistoryEntry, index, length){
      if(index == 0){
        branchTransactionHistoryEntry.set("closing_balance", branchTransactionHistoryEntry.get("balance"));
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
};

var calculateClosingBalanceFromStart = function(){

  startDate = moment.tz(moduleSettings.BRANCH_SUMMARY_START_DATE + " 00:00:00", timezoneConfig.CLIENT_ZONE);
  endDate = moment.tz(timezoneConfig.CLIENT_ZONE).hours(0).minutes(0).seconds(0);

  return adjustClosingBalanceWithinRange(startDate, endDate);
}

function generateDatesWithinRange(startDate, endDate){

  dates = [];

  for(let currentDate = startDate.clone(); currentDate.isBefore(endDate); ){

    dates.push(currentDate.format("YYYY-MM-DD"));

    currentDate.add(1, 'days');
  }

  return dates;
};

function getTransactionHistoryEntry(query){

  return branchTransactionHistory.findOne(query);
}

module.exports.populateForDate = populateForDate;
module.exports.populateFromStart = populateFromStart;
module.exports.adjustClosingBalanceWithinRange = adjustClosingBalanceWithinRange;
module.exports.calculateClosingBalanceFromStart = calculateClosingBalanceFromStart;
