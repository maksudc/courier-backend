'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.addColumn("shipments" , "destinationBranchType" , {
      type: Sequelize.ENUM('regional' , 'sub')
    });

    queryInterface.addColumn("shipments" , "destinationBranchId" , {
      type: Sequelize.INTEGER
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.removeColumn("shipments" , "destinationBranchType");
    queryInterface.removeColumn("shipments" , "destinationBranchId");
  }
};
