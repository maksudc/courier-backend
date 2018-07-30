var DB = require("../../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var corporationModel = sequelize.models.corporation;
var Promise = require("bluebird");

var MIN_CHARACTER_FOR_SEARCH = 6;

var search = function(req){

  hasQuery = false;

  whereQuery = {};
  if(req.query){
    if(req.query.mobile && req.query.mobile.length >= MIN_CHARACTER_FOR_SEARCH){
      whereQuery["mobile"] = {
        "$like": req.query.mobile + "%"
      }
      hasQuery = true;
    }
    if(req.query.full_name && req.query.full_name.length >= MIN_CHARACTER_FOR_SEARCH){
      whereQuery["full_name"] = {
        "$like": req.query.full_name + "%"
      }
      hasQuery = true;
    }
  }

  if(hasQuery){

    return clientModel.findAll({
      attributes: ["mobile", "full_name", "status"],
      where: whereQuery,
      order: [
        ['mobile', "ASC"]
      ]
    });
  }else{
    return Promise.resolve([]);
  }
};
module.exports.search = search;
