var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var order = sequelize.models.order;
var genericTracker = sequelize.models.genericTracker;
var item = sequelize.models.item;
var subBranch = sequelize.models.subBranch;
var regionalBranch = sequelize.models.regionalBranch;
var trackerLog = sequelize.models.trackerLog;
var moduleSettings = require("../config/moduleSettings");

var itemLogic = require("../logics/itemLogic");
var RouteLogic = require("../logics/branchRouteLogic");

var Promise = require("bluebird");
var _ = require("lodash");
var moment = require("moment");

function sanitizeBranchType(branchType){

  parts = [];

  if(branchType){
    parts = branchType.split("-");
  }

  if(parts.length > 0){
    return parts[0];
  }

  return ;
}

item.hook("beforeCreate" , function(instance , options){

  var snapshotInstance = instance._previousDataValues;
  var updatedInstance = instance.dataValues;

  return order
  .findOne({ where: { uuid: updatedInstance.orderUuid } , transaction: options.transaction })
  .then(function(parentOrderInstance){

    if(parentOrderInstance){

      if(parentOrderInstance.entry_branch_type){

        entry_branch_type_parts = parentOrderInstance.entry_branch_type.split("-");
        if(entry_branch_type_parts.length > 0){
          instance.set("entry_branch_type", entry_branch_type_parts[0]);
        }
      }
      if(parentOrderInstance.entry_branch){
        instance.set("entry_branch", parentOrderInstance.entry_branch);
      }

      if(parentOrderInstance.exit_branch_type){

        exit_branch_type_parts = parentOrderInstance.exit_branch_type.split("-");
        if(exit_branch_type_parts.length > 0){
          instance.set("exit_branch_type", exit_branch_type_parts[0]);
        }
      }
      if(parentOrderInstance.exit_branch){
        instance.set("exit_branch", parentOrderInstance.exit_branch);
      }

      if(parentOrderInstance.current_hub_type){

        branch_parts = parentOrderInstance.current_hub_type.split("-");
        if(branch_parts.length > 0){
          instance.set("current_hub_type", branch_parts[0]);
        }
      }
      if(parentOrderInstance.current_hub){
        instance.set("current_hub", parentOrderInstance.current_hub);
      }

      if(parentOrderInstance.next_hub_type){

        branch_parts = parentOrderInstance.next_hub_type.split("-");
        if(branch_parts.length > 0){
          instance.set("next_hub_type", branch_parts[0]);
        }
      }
      if(parentOrderInstance.next_hub){
        instance.set("next_hub", parentOrderInstance.next_hub);
      }
    }
  });
});
