'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addIndex("money" ,   {
        name: "idx_destination_branch",
        method: "BTREE",
        fields: ["regional_branch_id", "sub_branch_id", "createdAt"]
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex("money", "idx_destination_branch");
  }
};
