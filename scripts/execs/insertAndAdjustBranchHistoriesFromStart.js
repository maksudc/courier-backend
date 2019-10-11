var populateBranchTransactionHistories = require("./../populateBranchTransactionHistories");

populateBranchTransactionHistories.populateFromStart().then(function(res){
  return populateBranchTransactionHistories.calculateClosingBalanceFromStart();
})
.then(function(res){
  console.log("Eveerything run");
})
.catch(function(err){
  console.error(err);
});
