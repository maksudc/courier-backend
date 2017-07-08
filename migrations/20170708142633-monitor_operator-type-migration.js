'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.changeColumn('admins' , 'role' , {
      type: Sequelize.ENUM('super_admin', 'system_operator', 'accountant', 'branch_operator', 'operator' , 'monitor_operator'),
			defaultValue: 'operator',
			allowNull: false
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.changeColumn('admins' , 'role' , {
      type: Sequelize.ENUM('super_admin', 'system_operator', 'accountant', 'branch_operator', 'operator'),
			defaultValue: 'operator',
			allowNull: false
    });
  }
};
