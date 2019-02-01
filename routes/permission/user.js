var express = require('express');
var router = express.Router();

var passport = require("passport");
var authMiddleware  = require("./../../middleware/auth");

var permissionLogic = var DB = require("./../../logics/userPermissionLogic");

var HttpStatusCodes = require("http-status-codes");

var Promise = require("bluebird");

router.get("/acl/", passport.authenticate('basic', {session: false}), function(req, res){

  var user = req.user;

  permissionLogic.getPermissionEntries()
  .map(function(permission){
    return Promise.all([
      permission
      permissionLogic.hasGivenPermissionForUser(permission, user.email)
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

module.exports = router;
