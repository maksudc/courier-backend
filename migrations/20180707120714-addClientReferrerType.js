'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addColumn("clients", "referrer_type", {
			type: Sequelize.ENUM('admin', 'client', 'external'),
			defaultValue: 'admin',
			allowNull: true
		});
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.removeColumn("clients", "referrer_type");
  }
};
