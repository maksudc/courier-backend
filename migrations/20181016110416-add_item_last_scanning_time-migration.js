'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addColumn("items", "last_scanned_at", {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.removeColumn("items", "last_scanned_at");
  }
};
