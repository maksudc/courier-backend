'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.removeColumn("activities" , "time");
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.addColumn("activities", "time", {
          type: Sequelize.DATE,
          allowNull: false
        });
  }
};
