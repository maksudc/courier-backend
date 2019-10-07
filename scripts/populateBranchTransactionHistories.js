var DB = require("../models");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var subBranchModel = sequelize.models.subBranch;
var branchTransactionHistoryModel = sequelize.models.branchTransactionHistory;

var Promise = require("./bluebird");
var moment = require("moment-timezone");

var timezoneConfig = require("./../config/timezone");
var branchUtils = require("./../utils/branch");

var populateForDate = function(dayStr){

  dayStartTimeStr = dayStr + " 00:00:00";
  dateStart = moment.tz(dayStartTimeStr, timezoneConfig.CLIENT_ZONE);
  utcDateStart = dateStart.tz(timezoneConfig.COMMON_ZONE);

  dayEndTimeStr = dayStr + " 23:59:59";
  dateEnd = moment.tz(dayEndTimeStr, timezoneConfig.CLIENT_ZONE);
  utcDateEnd = dateEnd.tz(timezoneConfig.COMMON_ZONE);

  commonParams = {
    "datetime_range_start": utcDateStart.format("YYYY-MM-DD HH:mm:ss"),
    "datetime_range_end": utcDateEnd.format("YYYY-MM-DD HH:mm:ss")
  };

  return sequelize.transaction(function(t){

    return subBranchModel.findAll({
      transaction: t
    })
    .map(function(branchInstance){

      params = Object.assign({}, commonParams);
      params[""]
      branchTransactionHistoryModel.create({

      });
    });
  });
}
