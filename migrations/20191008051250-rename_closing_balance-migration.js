'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.renameColumn("branchTransactionHistories", "cumulative_balance", "closing_balance");
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.renameColumn("branchTransactionHistories", "closing_balance", "cumulative_balance");
  }
};
