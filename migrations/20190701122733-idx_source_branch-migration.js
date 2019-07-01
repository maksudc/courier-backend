'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addIndex("money" ,   {
        name: "idx_source_branch",
        method: "BTREE",
        fields: ["source_regional_branch_id", "source_sub_branch_id", "createdAt"]
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex("money", "idx_source_branch");
  }
};
