'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.addColumn("genericTrackers" , "previousBranchType" ,  { type: Sequelize.ENUM( 'sub' , 'regional' ) , defaultValue:'regional' });
    queryInterface.addColumn("genericTrackers" , "previousBranchId" , { type: Sequelize.INTEGER });

    queryInterface.addColumn("genericTrackers" , "nextBranchType" ,  { type: Sequelize.ENUM( 'sub' , 'regional' ) , defaultValue:'regional' });
    queryInterface.addColumn("genericTrackers" , "nextBranchId" , { type: Sequelize.INTEGER });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.removeColumn("genericTrackers" , "previousBranchType");
    queryInterface.removeColumn("genericTrackers" , "previousBranchId");

    queryInterface.removeColumn("genericTrackers" , "nextBranchType");
    queryInterface.removeColumn("genericTrackers" , "nextBranchId");
  }
};
