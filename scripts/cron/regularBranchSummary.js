var populateBranchTransactionHistories = require("./../populateBranchTransactionHistories");
var moment = require("moment-timezone");
var timezoneConfig = require("./../../config/timezone");

var currentDate = moment.tz(timezoneConfig.CLIENT_ZONE);

var dayAfterGeneration = currentDate.clone().hours(6).minutes(0).seconds(0);
var generationStartDate = dayAfterGeneration.clone().subtract(1, 'days');
var dayBeforeGeneration = generationStartDate.clone().subtract(1, 'days');


populateBranchTransactionHistories.getBranches()
.map(function(branchInstance){

  return Promise.all([
    populateBranchTransactionHistories.populateSingleBranchForDate(branchInstance, generationStartDate),
    Promise.resolve(branchInstance)
  ]);
}).map(function(complexResult){

  branchInstance = complexResult[1];
  return populateBranchTransactionHistories.cumulativeAdjustmentForBranchWithinRange(branchInstance, dayBeforeGeneration, dayAfterGeneration)
})
.then(function(res){
  console.log("Day job completed for generating accounting report");
})
.catch(function(err){
  if(err){
    console.error(err.stack);
  }
});
