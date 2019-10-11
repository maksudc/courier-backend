var populateBranchTransactionHistories = require("./../populateBranchTransactionHistories");
var moment = require("moment-timezone");
var timezoneConfig = require("./../../config/timezone");

currentDate = moment.tz(timezoneConfig.CLIENT_ZONE);
generationStartDate = currentDate.clone().subtract(1, 'days');
populateBranchTransactionHistories.populateForDate(generationStartDate.format("YYYY-MM-DD"));
