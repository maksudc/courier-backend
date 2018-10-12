var DB = require("../models");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var orderModel = DB.sequelize.models.order;
var adminModel = DB.sequelize.models.admin;

var Promise = require("bluebird");
var request = require("request-promise");
var btoa = require("btoa");

var fs = require("fs");

var BASE_URL = "http://localhost:8000";

var requestForOrder = function(orderInstance, options){

  return request(options)
  .then(function(response){
    var isValid = response["status"] == "success" && response["data"] && response["data"]["orderData"];
    return Promise.resolve([orderInstance, isValid]);
  })
  .catch(function(err){
    return Promise.resolve([orderInstance, false]);
  });
};

var findErrorOrderBarcodes = function(limit, offset){

  var totalOrderCount = 0;

  var privilegedAdmin = null;

  return adminModel.findAll({
    where: {
      role: "super_admin",
    },
    limit: 1
  })
  .then(function(admins){

    if(admins.length > 0){
        privilegedAdmin = admins[0];
    }else{
      return Promise.reject(new Error("No suitable admin found for processing"));
    }
  })
  .then(function(){

      return orderModel.findAll({
      attributes: ["uuid", "bar_code", "status", "type"],
      where:{
        status:{
          "$notIn": ["stocked", "delivered"]
        }
      },
      order: "bar_code ASC",
      limit: limit,
      offset: offset
    });
  })
  .map(function(orderInstance){

    encodeBuffer = new Buffer(privilegedAdmin.get('email') + ":" + privilegedAdmin.get('password'));
    encodedAuthorization = encodeBuffer.toString("base64");

    var orderUuid = orderInstance.get("uuid");

    options = {
      method: "GET",
      uri: BASE_URL + "/order/getOrderView/" + orderUuid,
      headers:{
        'Authorization': 'Basic ' + encodedAuthorization
      },
      json: true
    };

    return requestForOrder(orderInstance, options);
  })
  .map(function(complexResult){

    orderInstance = complexResult[0];
    isValid = complexResult[1];

    if(isValid === false){
      return Promise.resolve(orderInstance.get('bar_code'));
    }
    return null;
  })
  .then(function(results){

    invalidBarCodes = [];
    for(I=0; I < results.length; I++){
      if(results[I]){
        invalidBarCodes.push(results[I]);
      }
    }

    return Promise.resolve(invalidBarCodes);
  });
};

module.exports.findErrorOrderBarcodes = findErrorOrderBarcodes;

var deleteBarcodes = function(orderBarcodes){

  orderModel.destroy({
    where:{
      bar_code: {
        "$in": orderBarcodes
      }
    },
    individualHooks: true
  })
  .then(function(result){
    console.log(result);
  })
  .catch(function(err){
    console.error(err);
  });
};

module.exports.deleteBarcodes = deleteBarcodes;

var findAndSaveInvalidOrders = function(){

  var BASE_LIMIT = 100;
  var OUTPUT_FILE_PATH  = __dirname + "/output/invalid_bar_codes.txt";

  return orderModel.count({
    where:{
      status:{
        "$notIn": ["stocked", "delivered"]
      }
    }
  })
  .then(function(totalCount){

    console.log(totalCount);

    searchTracker = [];
    pageCount = totalCount / BASE_LIMIT;

    for(I=0; I <= pageCount; I++){
      searchTracker.push({
        "limit": BASE_LIMIT,
        "offset": I * BASE_LIMIT
      });
    }

    return Promise.resolve(searchTracker);
  })
  .map(function(complexResult){

    limit = complexResult["limit"];
    offset = complexResult["offset"];

    return findErrorOrderBarcodes(limit, offset);
  })
  .then(function(results){

    combinedBarcodes = [];
    for(I=0; I < results.length; I++){
      combinedBarcodes = combinedBarcodes.concat(results[I]);
    }

    fs.writeFile(OUTPUT_FILE_PATH, JSON.stringify(combinedBarcodes), function(err) {
      if(err) {
          return console.error(err);
      }
      console.log("file writing done");
    });

    return Promise.resolve(combinedBarcodes);
  })
  .catch(function(err){
    console.error(err);
  });
};

module.exports.findAndSaveInvalidOrders = findAndSaveInvalidOrders;

var deleteInvalidOrders = function(){

  return findAndSaveInvalidOrders()
  .then(function(invalidBarCodes){
    if(invalidBarCodes && invalidBarCodes.length > 0){
      return deleteBarcodes(invalidBarCodes);
    }
  });
};
module.exports.deleteInvalidOrders = deleteInvalidOrders;
