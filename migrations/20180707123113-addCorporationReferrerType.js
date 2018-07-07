'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addColumn("corporations", "referrer_type", {
			type: Sequelize.ENUM('admin', 'client', 'external'),
			defaultValue: 'admin',
			allowNull: true
		});
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.removeColumn("corporations", "referrer_type");
  }
};
