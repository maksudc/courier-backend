'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    
    return queryInterface.addColumn("scanActivities" , "operator" , {
      type: Sequelize.STRING,
      allowNull:false
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn("scanActivities" , "operator");
  }
};
