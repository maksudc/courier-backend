'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('printTrackerLogs','bar_code',{
      type:Sequelize.STRING,
      allowNull:false,
      default:"0"
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('bar_code');
  }
};
