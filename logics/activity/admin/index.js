var DB = require("./../../../models/");
var activityModel = DB.sequelize.models.activity;

module.exports.addAdminActivity = function(user , operation, params , options , callback){
  var activityInstance = null;

  return activityModel.create({
    operator: user.email,
    operation: operation,
    object_type: params.object_type,
    object_id: params.object_id,
    branch_type: params.branch_type,
    branch_id: params.branch_id,
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
  });
};
