'use strict';

var DB = require("../models/");
var orderModel = DB.sequelize.models.order;
var adminModel = DB.sequelize.models.admin;

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
    })
    .map(function(){

    });

  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
