'use strict';

var Promise = require("bluebird");

var DB = require("../models/");
var orderModel = DB.sequelize.models.order;
var adminModel = DB.sequelize.models.admin;
var branchUtils = require("../utils/branch");

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return
    orderModel.findAll({
      where:{
        "$or":[
          { payment_branch_migrate_affected: true },
          {
            "$and":[
              { payment_status: "paid" },
              {
                payment_operator:{
                  "$ne": null
                },
              },
              {
                payment_tag:{
                  '$eq': null
                }
              },
              {
                payment_hub_type:{
                  "$eq": null
                }
              },
              {
                payment_hub:{
                  "$eq": null
                }
              }
            ]
          }
        ]
      }
    })
    .map(function(orderInstance){

      operator_email = orderInstance.payment_operator;
      return Promise.all([
        orderInstance,
        adminModel.findOne({
          where: {
            "email": operator_email
          }
        })
      ]);
    })
    .map(function(bundle){
      orderInstance = bundle[0];
      adminInstance = bundle[1];

      payment_hub_type = null;
      payment_hub = null;
      payment_tag = null;

      if(adminInstance){

        if(adminInstance.sub_branch_id){
          payment_hub_type = "sub";
          payment_hub = adminInstance.sub_branch_id;
        }else if(adminInstance.regional_branch_id){
          payment_hub_type = "regional";
          payment_hub = adminInstance.regional_branch_id;
        }

        if(payment_hub_type == branchUtils.sanitizeBranchType(orderInstance.exit_branch_type) && payment_hub == orderInstance.exit_branch){
          payment_tag = "delivery";
        }else if(payment_hub_type == branchUtils.sanitizeBranchType(orderInstance.entry_branch_type) && payment_hub == orderInstance.entry_branch){
          payment_tag = "booking";
        }

        if(payment_hub_type){
          orderInstance.payment_hub_type = payment_hub_type;
        }
        if(payment_hub){
          orderInstance.payment_hub = payment_hub;
        }
        if(payment_tag){
          orderInstance.payment_tag = payment_tag;
        }
      }

      orderInstance.payment_branch_migrate_affected = true;

      return orderInstance.save();
    })
    .then(function(results){
      return true;
    }).catch(function(err){
      if(err){
        console.error(err.stack);
      }
      return false;
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return
    orderModel.findAll({
      where:{
        payment_branch_migrate_affected: true
      }
    })
    .map(function(orderInstance){

      orderInstance.payment_hub = null;
      orderInstance.payment_hub_type = null;
      orderInstance.payment_tag = null;
      orderInstance.payment_branch_migrate_affected = false;

      return orderInstance.save();
    })
    .then(function(results){
      return true;
    }).catch(function(err){
      if(err){
        console.error(err.stack);
      }
      return false;
    });
  }
};
