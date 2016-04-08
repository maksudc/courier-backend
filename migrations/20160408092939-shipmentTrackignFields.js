'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.addColumn("shipments" , "currentBranchType" ,  { type: Sequelize.ENUM( 'sub' , 'regional' ) , defaultValue:'regional' });
    queryInterface.addColumn("shipments" , "currentBranchId" , { type: Sequelize.INTEGER });

    queryInterface.addColumn("shipments" , "previousBranchType" ,  { type: Sequelize.ENUM( 'sub' , 'regional' ) , defaultValue:'regional' });
    queryInterface.addColumn("shipments" , "previousBranchId" , { type: Sequelize.INTEGER });

    queryInterface.addColumn("shipments" , "nextBranchType" ,  { type: Sequelize.ENUM( 'sub' , 'regional' ) , defaultValue:'regional' });
    queryInterface.addColumn("shipments" , "nextBranchId" , { type: Sequelize.INTEGER });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.removeColumn("shipments" , "currentBranchType");
    queryInterface.removeColumn("shipments" , "currentBranchId");

    queryInterface.removeColumn("shipments" , "previousBranchType");
    queryInterface.removeColumn("shipments" , "previousBranchId");

    queryInterface.removeColumn("shipments" , "nextBranchType");
    queryInterface.removeColumn("shipments" , "nextBranchId");
  }
};
