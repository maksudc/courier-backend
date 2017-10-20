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
var branchUtils = require("../../utils/branch");

function getOrderUpdateMap(payload){

  updateMap = {};

  if(payload.exit_branch_id){
    updateMap["exit_branch_id"] = payload.exit_branch_id;
  }
  if(payload.exit_branch_type){
    updateMap["exit_branch_type"] = branchUtils.desanitizeBranchType(payload.exit_branch_type);
  }
  if(payload.sender){
    updateMap["sender"] = payload.sender;
  }
  if(payload.sender_addr) updateMap["sender_addr"] = payload.sender_addr;

  if(payload.receiver){
    updateMap["receiver"] = payload.receiver;
  }
  if(payload.receiver_addr) updateMap["receiver_addr"] = payload.receiver_addr;

  // home_delivery might be here for legacy reason. Needs some testing to remove it. Instead a more general
  // delivery type is added which delegates the responsidbility
  if(payload.home_delivery) updateMap["deliveryType"] = 'home';
  if(payload.deliveryType){
    updateMap["deliveryType"] = payload.deliveryType;
  }

  if(payload.total_price && parseFloat(payload.total_price)){
    updateMap["payment"] = parseFloat(payload.total_price);
  }
  if(payload.payment) updateMap["payment"] = parseFloat(payload.payment);

  if(payload.order_discount && parseFloat(payload.order_discount)){
    updateMap["discount"] = payload.order_discount;
  }

  if(payload.nid) updateMap["nid"] = payload.nid;

  if(payload.order_vat != '0') updateMap["vat"] = true;

  return updateMap;
}

function getVDparams(postData){

  moneyData = {};

  if(postData.receiver){
    moneyData["sender_mobile"] = postData.receiver;
  }
  if(postData.receiver_name){
      moneyData["sender_full_name"] = postData.receiver_name;
  }

  if(postData.sender){
    moneyData["receiver_mobile"] = postData.sender;
  }
  if(postData.sender_name){
    moneyData["receiver_full_name"] = postData.sender_name;
  }
  if(postData.nid){
    moneyData["receiver_nid"] = postData.nid;
  }

  if(postData.vd_amount){
    moneyData["amount"] = postData.vd_amount;
  }
  if(postData.vd_charge){
    moneyData["charge"] = postData.vd_charge;
  }
  if(postData.vd_discount){
    moneyData["discount"] = postData.vd_discount;
  }
  if(postData.vd_payable){
    moneyData["payable"] = postData.vd_payable;
  }
  if(postData.vd_payBySender){
    moneyData["payParcelPrice"] = postData.vd_payBySender;
  }

  return moneyData;
}

var editOrder = function(orderUuid , user, payload , callback){

  var orderInstance = null;
  var moneyInstance = null;

  sequelize.transaction(function(t){

    orderModel.findOne({ where: { uuid: orderUuid } } , { transaction: t })
    .then(function(orderObject){

      orderInstance = orderObject;

      orderMap = getOrderUpdateMap(payload);
      return orderModel.update(orderMap , { transaction: t });
    })
    .then(function(){

      return orderInstance.getMoney_order();
    })
    .then(function(moneyObject){

      if(moneyObject){

        moneyInstance = moneyObject;
      }
    })
    .then(function(){

      if(orderInstance.type == "value_delivery"){
          moneyMap = getVDparams(payload);
          return moneyInstance.update(moneyMap , { transaction: t });
      }
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

  });
}

exports.editOrder = editOrder;
