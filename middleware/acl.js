var Promise = require("bluebird");
var businessPermissionLogic = require('./../logics/businessPermissionLogic');

var isUserAllowedForPermissions = function(permissionNames, association){

  return function(req, res, next){

    if(["super_admin"].indexOf(req.user.role) > -1){
      return next();
    }

    businessPermissionLogic.getPermissionEntitiesByName(permissionNames)
    .then(function(permissionObjs){
      return businessPermissionLogic.hasMultiplePermissionsForUser(permissionObjs, req.user.email, association);
    })
    .then(function(hasPerm){
      if(hasPerm){
          next();
      }else{
        res.status(403).send({
          message: "No Permission for this user"
        });
      }
    })
    .catch(function(err){
      message = "";
      if(err){
        message = err.message;
        console.error(err.stack);
      }
      res.status(500).send({
        message: message
      });
    });
  };
};

exports.isUserAllowedForPermissions = isUserAllowedForPermissions;
