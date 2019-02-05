var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var businessPermissionModel = sequelize.models.businessPermission;
var userPermissionModel = sequelize.models.userPermission;

var Promise = require("bluebird");

var getPermissionEntries = function(callback){

  var permissionObjects = null;

  return businessPermissionModel.findAll()
  .then(function(entries){
    permissionObjects = entries;
    return Promise.resolve(permissionObjects);
  })
  .map(function(permissionObject){
    permissionObject.dataValues["display_name"] = permissionObject.get("name").split("_").join(" ");
    return Promise.resolve(permissionObject);
  })
  .then(function(result){

    if(callback){
      callback(null, result);
    }
    return Promise.resolve(result);
  })
}

var hasPermissionForUser = function(permission, adminEmail, callback){

  return userPermissionModel.count({
    where: {
      admin: adminEmail,
      business_permission_id: permission.get("id")
    }
  })
  .then(function(count){

    hasPerm = count > 0;

    if(callback){
      callback(null, hasPerm);
    }
    return Promise.resolve(hasPerm);
  });
};

module.exports.getPermissionEntries = getPermissionEntries;
module.exports.hasPermissionForUser = hasPermissionForUser;
