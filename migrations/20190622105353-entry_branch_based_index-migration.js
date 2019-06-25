'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addIndex("orders" ,   {
        name: "idx_entry_branch",
        method: "BTREE",
        fields: ["entry_branch_type","entry_branch","status", "createdAt"]
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex("orders", "idx_entry_branch");
  }
};
