'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.removeIndex("manualTransactions", "transaction_referrer_index");
  },
};
