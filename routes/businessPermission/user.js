var express = require('express');
var router = express.Router();

var passport = require("passport");
var authMiddleware  = require("./../../middleware/auth");
var permissionLogic = require("./../../logics/businessPermissionLogic");
var adminLogic = require("./../../logics/admin/adminLogic");

var HttpStatusCodes = require("http-status-codes");
var Promise = require("bluebird");

router.get("/acl/", passport.authenticate('basic', {session: false}), function(req, res){

  var paramUser = null;

  adminLogic.findUniqueAdmin(req.query.email)
  .then(function(user){
    paramUser = user;
  })
  .then(function(){
    return permissionLogic.getPermissionEntries();
  })
  .map(function(permission){
    return Promise.all([
      permission,
      permissionLogic.hasPermissionForUser(permission, paramUser.email)
    ]);
  })
  .map(function(complexResult){

    permission = complexResult[0];
    isAllowed = complexResult[1];

    permission.dataValues["allowed"] = isAllowed;

    return Promise.resolve(permission);
  })
  .then(function(permissions){

    res.status(HttpStatusCodes.OK);
    res.send(permissions);
  })
  .catch(function(err){
    err_message = null;
    if(err){
      console.error(err);
      err_message  = err.message;
    }

    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    res.send({
      message: err_message
    });
  })
});

router.post("/change/", passport.authenticate('basic', {session: false}), function(req, res){

  var params = req.body;
  var paramAdminEmail = params["email"];
  var paramUser = null;

  adminLogic.findUniqueAdmin(paramAdminEmail)
  .then(function(user){
    paramUser = user;
  })
  .then(function(){
    return Promise.resolve(params.permissionMatrix);
  })
  .map(function(permissionDescriptor){
    return Promise.all([
      Promise.resolve(permissionDescriptor),
      permissionLogic.getPermissionEntity(permissionDescriptor["id"])
    ]);
  })
  .map(function(complexResult){
    permissionDescriptor = complexResult[0];
    permissionEntity = complexResult[1];

    if(permissionDescriptor["allowed"]){
      return permissionLogic.allowPermissionForUser(permissionEntity, paramUser.email);
    }else{
      return permissionLogic.denyPermissionForUser(permissionEntity, paramUser.email);
    }
  })
  .then(function(complexResult){

    res.status(HttpStatusCodes.OK);
    res.send({});
  })
  .catch(function(err){
    err_message = null;
    if(err){
      console.error(err);
      err_message  = err.message;
    }

    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    res.send({
      message: err_message
    });
  });
});

module.exports = router;
