var DB = require("../../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var adminModel = sequelize.models.admin;
var async = require('async');
var adminUtils = require("../../utils/admin");
var Promise = require("bluebird");

var getAllReferrers = function(){

  return adminModel.findAll({
    attributes: [ "id", "email", "full_name", "role", "state", "mobile" ],
    order: [
      ['full_name', 'ASC']
    ]
  });
}
module.exports.getAllReferrers = getAllReferrers;
