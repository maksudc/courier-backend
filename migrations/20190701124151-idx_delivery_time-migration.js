'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addIndex("money" ,   {
        name: "idx_delivery_time",
        method: "BTREE",
        fields: ["delivery_time", "regional_branch_id", "sub_branch_id"]
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex("money", "idx_delivery_time");
  }
};
