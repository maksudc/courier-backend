var populateBranchTransactionHistories = require("./../populateBranchTransactionHistories");

populateBranchTransactionHistories.parseBranchAdjustments()
.then(function(results){
  console.log("Successfully Completed Addition and adjustments");
})
.catch(function(err){
  console.error(err);
  if(err){
      console.error(err.stack);
  }
});
