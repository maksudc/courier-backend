'use strict';

var DB = require("../models/");
var orderModel = DB.sequelize.models.order;

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    //var thresholdDate = Date.parse("2016-12-24 23:59:59");
    var thresholdDate = "2017-01-06 23:59:59";
    var defaultDeliveryType = "branch";

    return orderModel.update(
      { deliveryType: defaultDeliveryType } ,
      { where: { confirm_time:{ $lt: thresholdDate } } }
    ).then(function(result){
      return true;
    }).catch(function(err){
      if(err){
          console.error(err.stack);
      }
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    var thresholdDate = "2017-01-06 23:59:59";
    var defaultDeliveryType = "home";

    return orderModel.update(
      { deliveryType: defaultDeliveryType } ,
      { where: { confirm_time:{ $lt: thresholdDate } } }
    ).then(function(result){
      return true;
    }).catch(function(err){
      if(err){
          console.error(err.stack);
      }
    });
  }
};
