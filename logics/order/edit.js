var DB = require("../../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var orderModel = sequelize.models.order;
var itemModel = sequelize.models.item;
var trackerLog = sequelize.models.trackerLog;
var genericTracker = sequelize.models.genericTracker;
var money = sequelize.models.money;
var clientModel = sequelize.models.client;

var _ = require("lodash");
var async = require("async");
var handlebars = require("handlebars");
var fs = require("fs");
var HttpStatus = require("http-status-codes");
var moment = require("moment");

var editOrder = function(orderUuid , user, payload , callback){

  var orderInstance = null;

  orderModel.findOne({ where: { uuid: orderUuid } })
  .then(function(orderObject){
    orderInstance = orderObject;
  })
  .then(function(){


  })
  .catch(function(err){

    if(err){

      callback(err , {
        status: "error",
        message: err.message
      });

      return;
    }

    callback(new Error("Unknown error") , {
      status: "error",
      message:
    });
  });

  res = {
    "status": "success",
    "orderUuid": orderUuid,
  };
  callback(null , res );
}

exports.editOrder = editOrder;
