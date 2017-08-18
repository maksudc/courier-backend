'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.sequelize.query(" DELETE FROM genericTrackers WHERE trackableType='orderItem' ");
  },

  down: function (queryInterface, Sequelize) {

  }
};
