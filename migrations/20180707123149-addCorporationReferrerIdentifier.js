'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addColumn("corporations", "referrer_identifier", {
			type: Sequelize.STRING,
			allowNull: true
		});
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.removeColumn("corporations", "referrer_identifier");
  }
};
