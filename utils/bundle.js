var isApplicableOrderForBundleProcessing = function(status){
   return ["stocked","delivered"].indexOf(status) > -1;
};

exports.isApplicableOrderForBundleProcessing = isApplicableOrderForBundleProcessing;
