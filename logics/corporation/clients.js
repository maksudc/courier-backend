var DB = require("./../../models/index");
var sequelize = DB.sequelize;
var corporationModel = sequelize.models.corporation;
var clientModel = sequelize.models.client;
var Promise = require("bluebird");

var addClientToCorporation = function(corporationId, mobile, options, callback){

  return clientModel.update({ corporationId: corporationId }, {
    where: { mobile: mobile },
    transaction: options.transaction
  })
  .then(function(result){
    if(callback){
      callback(null, result);
    }
    return Promise.resolve(result);
  })
  .catch(function(err){
    if(callback){
      callback(err, null);
    }
    return Promise.reject(err);
  });
};
module.exports.addClientToCorporation = addClientToCorporation;

var removeClientFromCorporation = function(corporationId, mobile, options, callback){

  return clientModel.update({ corporationId: null }, {
    where: { mobile: mobile },
    transaction: options.transaction
  })
  .then(function(result){
    if(callback){
      callback(null, result);
    }
    return Promise.resolve(result);
  })
  .catch(function(err){
    if(callback){
      callback(err, null);
    }
    return Promise.reject(err);
  });
};
module.exports.removeClientFromCorporation = removeClientFromCorporation;
