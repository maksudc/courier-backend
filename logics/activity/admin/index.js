var DB = require("./../../../models/");
var activityModel = DB.sequelize.models.activity;
var adminActivityUtils = require("./../../../utils/adminActivity");
var Promise = require("bluebird");

module.exports.addAdminActivity = function(user , operation, params , options , callback){

  var activityInstance = null;

  finalParams = adminActivityUtils.extractParams(user);
  // override or set any parameter extracted automatically
  // It allows the caller to force any paramter of their own like if they want to add the activity of another admin in near future
  for(key in params){
    finalParams[key] = params[key];
  }

  return activityModel.create({
    operator: user.email,
    operation: operation,
    object_type: finalParams.object_type,
    object_id: finalParams.object_id,
    branch_type: finalParams.branch_type,
    branch_id: finalParams.branch_id,
  } , options)
  .then(function(activityObj){

    activityObj = activityInstance;
    if(callback){
      callback(null , activityObj);
    }
  })
  .catch(function(err){
    if(callback){
      callback(err, activityObj);
    }
    return Promise.reject(err);
  });
};
