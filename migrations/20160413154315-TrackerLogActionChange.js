'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.changeColumn("trackerLogs" , "action" ,  {
      type: Sequelize.ENUM( "created" , "entrance" , "exit" , "reached" , "block" , "reopen" , "expired" , "delivered" ) ,
      allowNull:true
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.changeColumn("trackerLogs" , "action" ,  {
      type: Sequelize.ENUM( "created" , "entrance" , "exit" , "reached" , "block" , "reopen" , "expired" ) ,
      allowNull:true
    });
  }
};
