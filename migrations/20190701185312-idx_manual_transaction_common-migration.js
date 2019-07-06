'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addIndex("manualTransactions" ,   {
        name: "idx_manual_transaction_common",
        method: "BTREE",
        fields: ["transaction_type", "status", "branch_type", "branch_id", "createdAt"]
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex("manualTransactions", "idx_manual_transaction_common");
  }
};
