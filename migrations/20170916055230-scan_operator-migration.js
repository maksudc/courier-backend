'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.changeColumn('admins' , 'role' , {
      type: Sequelize.ENUM('super_admin', 'system_operator',
                           'accountant', 'branch_operator',
                           'operator' , 'monitor_operator',
                           'scan_operator'),
      defaultValue: 'operator',
      allowNull: false
    });
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.changeColumn('admins' , 'role' , {
      type: Sequelize.ENUM('super_admin', 'system_operator',
                           'accountant', 'branch_operator',
                           'operator' , 'monitor_operator'),
      defaultValue: 'operator',
      allowNull: false
    });
  }
};
