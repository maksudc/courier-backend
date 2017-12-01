var DB = require("../../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var orderModel = sequelize.models.order;
var itemModel = sequelize.models.item;
var trackerLog = sequelize.models.trackerLog;
var genericTracker = sequelize.models.genericTracker;
var moneyModel = sequelize.models.money;
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

  if(payload.order_vat != '0'){
      updateMap["vat"] = true;
  }else{
      updateMap["vat"] = false;
  }

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

  var itemMaps = {};

  var itemPreviousCount = 0;

  var itemAvailaleIndexes = [];

  var insertOpCount = 0;
  var deleteOpCount = 0;
  var finalItemCount = 0;

  sequelize.transaction(function(t){

    return orderModel.findOne({ where: { uuid: orderUuid } , transaction: t }) //, { transaction: t })
    .then(function(orderObject){

      orderInstance = orderObject;

      orderMap = getOrderUpdateMap(payload);
      return orderInstance.update(orderMap , { transaction: t });
    })
    .then(function(){

      return itemModel.count({ where: { orderUuid: orderInstance.uuid } , transaction: t });
    })
    .then(function(count){

      itemPreviousCount = count;
    })
    .then(function(){

      return moneyModel.findOne({
          where: { type: "virtual_delivery", money_order_id: orderUuid },
          transaction: t
        }
      );
    })
    .then(function(moneyObject){

      moneyInstance = moneyObject;
      if(orderInstance.type == "value_delivery"){

          moneyMap = getVDparams(payload);
          return moneyInstance.update(moneyMap , { transaction: t });
      }

      return Promise.resolve(true);
    })
    .then(function(){

      for(I=0 ; I < payload.item_ops ; I++){

        if(payload.item_ops[I]["op"]=="delete"){
          deleteOpCount++;
        }else if(payload.item_ops[I]["op"]=="insert"){
          insertOpCount++;
        }
      }
      finalItemCount = itemPreviousCount - deleteOpCount + insertOpCount;
      for(I=0 ; I< finalItemCount ; I++){
        itemAvailaleIndexes[I] = true;
      }

      return Promise.resolve(payload.item_ops);
    })
    .map(function(itemOp){

      if(itemOp){

        if(itemOp["op"] == "insert"){

          newInstanceData = itemOp["data"];

          newInstanceData["orderUuid"] = orderInstance.uuid;

          newInstanceData["entry_branch_type"] = branchUtils.sanitizeBranchType(orderInstance.entry_branch_type);
          newInstanceData["entry_branh"] = parseInt(orderInstance.entry_branch);

          newInstanceData["exit_branch_type"] = branchUtils.sanitizeBranchType(orderInstance.exit_branch_type);
          newInstanceData["exit_branch"] = parseInt(orderInstance.exit_branch);

          newInstanceData["current_hub_type"] = orderInstance.current_hub_type;
          newInstanceData["current_hub"] = orderInstance.current_hub;

          newInstanceData["next_hub_type"] = orderInstance.next_hub_type;
          newInstanceData["next_hub"] = orderInstance.next_hub;

          if(orderInstance.status != "draft"){
            newInstanceData["status"] = orderInstance.status;
          }

          return itemModel.create(newInstanceData , { transaction: t , hooks: false });

        }else if(itemOp["op"] == "update"){

          path_parts = itemOp["path"].split("/");
          itemUuid = path_parts[2];

          // Since this only updates the basic descriptions of the item associated
          // We do not need to call the hooks.
          // Status can not be changed by editing the other attributes of item instance
          return itemModel.update(itemOp["data"] , { where: { uuid: itemUuid } , transaction: t });

        }else if(itemOp["op"] == "delete"){

          path_parts = itemOp["path"].split("/");
          itemUuid = path_parts[2];

          return itemModel.destroy({ where: { uuid: itemUuid } , transaction: t });
        }
      }

      return Promise.resolve(false);
    })
    .then(function(results){

      return itemModel.findAll({ where: { orderUuid: orderInstance.uuid } , attributes:[ "uuid" , "bar_code" ] , transaction: t });
    })
    .then(function(itemObjs){

      for(I=0 ; I < itemObjs.length ; I++){
        itemObjs[I].set("bar_code" , "" + orderInstance.bar_code + "-" + I);
      }

      return Promise.resolve(itemObjs);
    })
    .map(function(itemObj){

      return itemObj.save({ transaction: t , hooks: false });
    });
  })
  .then(function(results){

    callback(null , {
      status: "success",
      orderUuid: orderUuid
    });
    return Promise.resolve(true);
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
      status: "error"
    });
  });
};

exports.editOrder = editOrder;
