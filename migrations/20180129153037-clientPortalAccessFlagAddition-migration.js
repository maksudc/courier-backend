'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addColumn("clients", "has_portal_access", {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false
		});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn("clients", "has_portal_access");
  }
};
