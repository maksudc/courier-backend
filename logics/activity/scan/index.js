var DB = require("./../../../models/");
var scanActivityModel = DB.sequelize.models.scanActivity;
var scanActivityUtils = require("./../../../utils/scanActivity");
var Promise = require("bluebird");

module.exports.addScanActivity = function(user, params , options , callback){

  var scanActivityInstance = null;

  finalParams = scanActivityUtils.extractParams(user);
  // override or set any parameter extracted automatically
  // It allows the caller to force any paramter of their own like if they want to add the activity of another admin in near future
  for(key in params){
    finalParams[key] = params[key];
  }

  return scanActivityModel.create({

    operator: user.email,
    object_type: finalParams.object_type,
    object_id: finalParams.object_id,
    branch_type: finalParams.branch_type,
    branch_id: finalParams.branch_id,
    bundleId: finalParams.bundleId,
    responseCode: finalParams.responseCode

  } , options)
  .then(function(scanActivityObj){

    scanActivityInstance = scanActivityObj;
    if(callback){
      callback(null , scanActivityInstance);
    }
  }).catch(function(err){

    if(callback){
      callback(err , scanActivityInstance);
    }
    return Promise.reject(err);
  });

};
