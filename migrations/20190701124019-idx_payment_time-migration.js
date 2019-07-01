'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addIndex("money" ,   {
        name: "idx_payment_time",
        method: "BTREE",
        fields: ["payment_time", "source_regional_branch_id", "source_sub_branch_id"]
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex("money", "idx_payment_time");
  }
};
