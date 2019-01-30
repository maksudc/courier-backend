var DB = require("../models");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var permissions = require("./fixtures/business_perms");
var businessPermissionModel = DB.sequelize.models.businessPermission;

var Promise = require("bluebird");

var populate = function(){

  return Promise.resolve(permissions)
  .map(function(permObj){

    return businessPermissionModel.findOrCreate({
      where: {
        name: permObj["name"]
      },
      defaults:{
        name: permObj["name"]
      }
    })
  })
  .map(function(complexResult){
    permission = complexResult[0];
    created = complexResult[1];

    return Promise.resolve(created);
  });
};
module.exports.populate = populate;
