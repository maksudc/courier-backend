var populateBranchTransactionHistories = require("./../populateBranchTransactionHistories");
var moment = require("moment-timezone");
var timezoneConfig = require("./../../config/timezone");

var currentDate = moment.tz(timezoneConfig.CLIENT_ZONE);

var dayAfterGeneration = currentDate.clone().hours(6).minutes(0).seconds(0);
var generationStartDate = dayAfterGeneration.clone().subtract(1, 'days');
var dayBeforeGeneration = generationStartDate.clone().subtract(1, 'days');

populateBranchTransactionHistories.populateForDate(generationStartDate.format("YYYY-MM-DD"))
.then(function(){
    return populateBranchTransactionHistories.adjustClosingBalanceWithinRange(dayBeforeGeneration, dayAfterGeneration, "relative");
})
.then(function(res){
  console.log("Day job completed for generating accounting report");
})
.catch(function(err){
  if(err){
    console.error(err.stack);
  }
});
