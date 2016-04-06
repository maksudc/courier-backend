'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.addColumn("genericTrackers" , "sourceBranchType" , {
      type: Sequelize.ENUM( 'sub' , 'regional' ) ,
      defaultValue:'regional'
    });

    queryInterface.addColumn("genericTrackers" , "sourceBranchId" , {
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
    queryInterface.removeColumn("genericTrackers" , "sourceBranchType");
    queryInterface.removeColumn("genericTrackers" , "sourceBranchId");
  }
};
