var DB = require("../../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var corporationModel = sequelize.models.corporation;
var Promise = require("bluebird");

var MIN_CHARACTER_FOR_MOBILE_SEARCH = 6;
var MIN_CHARACTER_FOR_NAME_SEARCH = 3;

var search = function(req){

  hasQuery = false;
  whereQuery = {};

  if(req.query){
    if(req.query.mobile && req.query.mobile.length >= MIN_CHARACTER_FOR_MOBILE_SEARCH){
      whereQuery["mobile"] = {
        "$like": req.query.mobile + "%"
      }
      hasQuery = true;
    }
    if(req.query.name && req.query.name.length >= MIN_CHARACTER_FOR_NAME_SEARCH){
      whereQuery["name"] = {
        "$like": "%" + req.query.name + "%"
      }
      hasQuery = true;
    }
  }

  if(hasQuery){

    return corporationModel.findAll({
      attributes: ["id","name","email", "mobile", "address", "status", "has_portal_access", "referrer_type", "referrer_identifier"],
      where: whereQuery,
      order: [
        ['name', "ASC"]
      ]
    });
  }else{
    return Promise.resolve([]);
  }
};
module.exports.search = search;
