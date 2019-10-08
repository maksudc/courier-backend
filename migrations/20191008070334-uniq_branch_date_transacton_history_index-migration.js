'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addIndex("branchTransactionHistories" ,   {
        name: "uniq_branch_date",
        unique: true,
        type: "UNIQUE",
        fields: ["branch_type", "branch_id", "date_start", "date_end"]
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex("branchTransactionHistories", "uniq_branch_date");
  }
};
