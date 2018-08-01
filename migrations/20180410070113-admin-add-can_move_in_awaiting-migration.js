'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn("admins", "can_move_order_in_awaiting", {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false
		});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn("admins", "can_move_order_in_awaiting");
  }
};
