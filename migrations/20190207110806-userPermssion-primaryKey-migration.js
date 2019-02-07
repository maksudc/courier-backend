'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addColumn("userPermissions", "id", {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    });
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.removeColumn("userPermissions", "id");
  }
};
