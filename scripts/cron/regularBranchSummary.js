var populateBranchTransactionHistories = require("./../populateBranchTransactionHistories");
var moment = require("moment-timezone");
var timezoneConfig = require("./../../config/timezone");

var currentDate = moment.tz(timezoneConfig.CLIENT_ZONE);
var generationStartDate = currentDate.clone().subtract(1, 'days');

populateBranchTransactionHistories.populateForDate(generationStartDate.format("YYYY-MM-DD"))
.then(function(){
    return populateBranchTransactionHistories.calculateClosingBalanceFromStart();
})
.then(function(res){
  console.log("Day job completed for generating accounting report");
})
.catch(function(err){
  if(err){
    console.error(err.stack);
  }
});
