var DB = require("../models");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var orderModel = DB.sequelize.models.order;
var adminModel = DB.sequelize.models.admin;

var Promise = require("bluebird");
var request = require("request-promise");
var btoa = require("btoa");

var findErrorOrderBarcodes = function(){

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

    return
    orderModel.findAndCountAll({
      attributes: ["uuid", "bar_code", "status", "type"],
      where:{
        status:{
          "$notIn": ["stocked", "delivered"]
        },
        order: "bar_code ASC"
      }
    });
  })
  .then(function(result){

    totalOrderCount = result.count;

    return Promise.resolve(result.rows);
  })
  .map(function(orderInstance){

    options = {
      method: "GET",
      uri: "/order/getOrderView/" + orderInstance.get("uuid"),
      headers:{
        'Authorization': 'Basic ' + btoa(privilegedAdmin.username + ":" + privilegedAdmin.password)
      },
      json: true
    };

    return request(options);
  });
};
