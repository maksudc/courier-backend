'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.changeColumn("activities" , "operation" , {
      type: Sequelize.ENUM('create' , 'update', 'delete' , 'confirm' , 'money_receive' , 'mark_deliverable' , 'seal' , 'scan'),
      allowNull: false
    });
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.changeColumn("activities" , "operation" , {
      type: Sequelize.ENUM('create' , 'update', 'delete' , 'confirm' , 'money_receive' , 'mark_deliverable' , 'seal'),
      allowNull: false
    });
  }
};
