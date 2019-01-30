'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addIndex("userPermissions", {
      fields: ["admin", "business_permission_id"],
      unique: true,
      type: "UNIQUE",
      name: "uniq_user_perm"
    });
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.removeIndex("userPermissions", "uniq_user_perm");
  }
};
