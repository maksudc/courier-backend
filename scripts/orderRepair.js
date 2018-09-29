var DB = require("../models");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var orderModel = DB.sequelize.models.order;
var adminModel = DB.sequelize.models.admin;

var Promise = require("bluebird");
var request = require("request-promise");
var btoa = require("btoa");

var fs = require("fs");

var findErrorOrderBarcodes = function(limit, offset){

  var totalOrderCount = 0;

  var privilegedAdmin = null;

  adminModel.findAll({
    where: {
      role: "super_admin",
    },
    limit: 1
  })
  .then(function(admin){
    privilegedAdmin = admin;
  })
  .then(function(){

      return orderModel.findAndCountAll({
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
  .then(function(result){

    totalOrderCount = result.count;

    return Promise.resolve(result.rows);
  })
  .map(function(orderInstance){

    var orderUuid = orderInstance.get("uuid");

    options = {
      method: "GET",
      uri: "/order/getOrderView/" + orderUuid,
      headers:{
        'Authorization': 'Basic ' + btoa(privilegedAdmin.username + ":" + privilegedAdmin.password)
      },
      json: true
    };

    return request(options)
    .then(function(response){
      var isValid = response["status"] == "success" && response["data"] && response["data"]["orderData"];
      return Promise.resolve([orderInstance, isValid]);
    })
    .catch(function(err){
      console.error(err);
      return Promise.resolve([orderInstance, null]);
    });
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

    return Promie.resolve(invalidBarCodes);
  });
};

module.exports.findErrorOrderBarcodes = findErrorOrderBarcodes;

var deleteBarcodes = function(orderBarcodes){

  orderModel.delete({
    where:{
      bar_code: {
        "$in": orderBarcodes
      }
    }
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
  var OUTPUT_FILE_PATH  = "./scripts/invalid_bar_codes.txt";

  orderModel.count({
    where:{
      status:{
        "$notIn": ["stocked", "delivered"]
      }
    }
  })
  .then(function(totalCount){

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

    limit = complexResult[0];
    offset = complexResult[1];

    return findErrorOrderBarcodes(limit, offset);
  })
  .map(function(invalidBarCodes){

    invalidBarCodeString = invalidBarCodes.join(",");

    fs.appendFile(OUTPUT_FILE_PATH, invalidBarCodeString, function(err) {
      if(err) {
          return console.error(err);
      }
      console.log(invalidBarCodeString + " was appended");
    });

    return true;
  })
  .then(function(results){
    
  })
  .catch(function(err){
    console.error(err);
  });
};

module.exports.findAndSaveInvalidOrders = findAndSaveInvalidOrders;
