'use strict';

var DB = require("./../models/");
var permissionModel = DB.sequelize.models.permission;

module.exports = {
  up: function (queryInterface, Sequelize) {

    return permissionModel.update({ monitor_operator: true } , {
      "where": {
        "url":{
          "$in": [
            "/money/confirm",
            "/money/create",
            "/order/createByOperator"
          ]
        }
      }
    });
  },

  down: function (queryInterface, Sequelize) {

    return permissionModel.update({ monitor_operator: false } , {
      "where": {
        "url":{
          "$in": [
            "/money/confirm",
            "/money/create",
            "/order/createByOperator"
          ]
        }
      }
    });
  }
};
