var DB = require("../../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var adminModel = sequelize.models.admin;
var clientModel = sequelize.models.client;
var async = require('async');
var adminUtils = require("../../utils/admin");
var Promise = require("bluebird");

var getAllReferrers = function(){

  return adminModel.findAll({
    attributes: [ "email", "full_name", "role", "state", "mobile" ],
    order: [
      ['full_name', 'ASC']
    ]
  });
}
module.exports.getAllReferrers = getAllReferrers;

var getAllReferredClients = function($referrerIdentifier){

  return clientModel.findAll({
    attributes: ["mobile", "full_name", "status"],
    order: [
      ['mobile', "ASC"]
    ],
    where:{
      referrer_type: "admin",
      referrer_identifier: $referrerIdentifier
    }
  });
}
module.exports.getAllReferredClients = getAllReferredClients;


var MIN_REFERRER_SEARCH_LENGTH = 3;

var getReferrersBySearchingName = function($name){

  if($name && $name.length >= MIN_REFERRER_SEARCH_LENGTH){

    return adminModel.findAll({
      attributes: [ "email", "full_name", "role", "state", "mobile" ],
      where:{
        full_name:{
          "$like": "%" + $name + "%"
        }
      },
      order: [
        ['full_name', 'ASC']
      ]
    });
  }

  return Promise.resolve([]);
}
module.exports.getReferrersBySearchingName = getReferrersBySearchingName;
