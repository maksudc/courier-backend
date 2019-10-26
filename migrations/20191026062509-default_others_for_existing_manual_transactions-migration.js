'use strict';

var Promise = require("bluebird");
var moment = require("moment-timezone");
var timezoneConfig = require("./../config/timezone");

let eventHorizonDateStr = "2019-10-24 07:00:00";
let eventHorizon = moment(eventHorizonDateStr, timezoneConfig.CLIENT_ZONE);
let utcEventHorizon = eventHorizon.clone().tz(timezoneConfig.COMMON_ZONE);

module.exports = {
  up: function (queryInterface, Sequelize) {

    // Makes the default manual transactions prior to 24 Oct, 2019 having
    // expenditureType = `NULL` to expenditureType = `Other's`
    // The date is mentioned here to make sure any manual transaction created prior to tha date should be reversed

    return queryInterface.sequelize.query('SELECT id FROM expenditureTypes WHERE name="Other\'s" LIMIT 1')
    .then(function(results){

      var expenditureId = results[0][0]["id"];

      return queryInterface.bulkUpdate("manualTransactions", {
        expenditure_Type: expenditureId
      }, {
        createdAt: {
          "$lte": utcEventHorizon.format("YYYY-MM-DD HH:mm:ss")
        },
        expenditure_Type:{
          "$eq": null
        }
      });
    });
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.sequelize.query('SELECT id FROM expenditureTypes WHERE name="Other\'s" LIMIT 1')
    .then(function(results){

      var expenditureId = results[0][0]["id"];

      return queryInterface.bulkUpdate("manualTransactions", {
        expenditure_Type: null
      }, {
        createdAt: {
          "$lte": utcEventHorizon.format("YYYY-MM-DD HH:mm:ss")
        },
        expenditure_Type:{
          "$eq": expenditureId
        }
      });
    });
  }
};
