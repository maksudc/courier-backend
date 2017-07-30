'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addColumn('permissions' , 'monitor_operator' , {
      type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false
    });
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.removeColumn('permissions' , 'monitor_operator');
  }
};
