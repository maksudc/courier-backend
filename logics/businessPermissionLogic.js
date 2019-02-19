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

var hasMultiplePermissionsForUser = function(permissions, adminEmail, association, callback){

  if(!association){
    association = "and";
  }

  whereQuery = {};
  associationKey = "$" + association;
  whereQuery[associationKey] = [];
  for(I=0; I < permissions.length; I++){
    whereQuery[associationKey].push({
      admin: adminEmail,
      business_permission_id: permissions[I].get("id")
    });
  }

  return userPermissionModel.count({
    where: whereQuery
  })
  .then(function(count){
    
    hasPerm = count > 0;

    if(callback){
      callback(null, hasPerm);
    }
    return Promise.resolve(hasPerm);
  });
};

var allowPermissionForUser = function(permission, adminEmail, callback){

  return userPermissionModel.findOrCreate({
    where: {
      admin: adminEmail,
      business_permission_id: permission.get("id")
    },
    defaults: {
      admin: adminEmail,
      business_permission_id: permission.get("id")
    }
  });
};

var denyPermissionForUser = function(permission, adminEmail, callback){

  return userPermissionModel.destroy({
    where: {
      admin: adminEmail,
      business_permission_id: permission.get("id")
    }
  });
};

var getPermissionEntity = function(id){
  return businessPermissionModel.findOne({
    where:{
      id: id
    }
  });
};

var getPermissionEntitiesByName = function(names){
  return businessPermissionModel.findAll({
    where:{
      name: {
        "$in": names
      }
    }
  });
};

module.exports.getPermissionEntries = getPermissionEntries;
module.exports.hasPermissionForUser = hasPermissionForUser;
module.exports.allowPermissionForUser = allowPermissionForUser;
module.exports.denyPermissionForUser = denyPermissionForUser;
module.exports.getPermissionEntity  = getPermissionEntity;
module.exports.getPermissionEntitiesByName = getPermissionEntitiesByName;
module.exports.hasMultiplePermissionsForUser = hasMultiplePermissionsForUser;
