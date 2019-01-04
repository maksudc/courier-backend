'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.renameColumn("manualTransactions", "recieved_by", "received_by")
    .then(function(){
      return queryInterface.renameColumn("manualTransactions", "recieved_at", "received_at")
    });
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.renameColumn("manualTransactions", "received_by", "recieved_by")
    .then(function(){
      return queryInterface.renameColumn("manualTransactions", "received_at", "recieved_at")
    });
  }
};
