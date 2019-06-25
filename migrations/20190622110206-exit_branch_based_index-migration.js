'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addIndex("orders" ,   {
        name: "idx_exit_branch",
        method: "BTREE",
        fields: ["exit_branch_type","exit_branch","status", "createdAt"]
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex("orders", "idx_exit_branch");
  }
};
