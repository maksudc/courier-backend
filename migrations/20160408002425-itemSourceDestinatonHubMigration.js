'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

    queryInterface.addColumn("items" , "entry_branch" , {type: Sequelize.STRING});
    queryInterface.addColumn("items" , "entry_branch_type" , {type: Sequelize.ENUM('regional-branch', 'sub-branch')});
    queryInterface.addColumn("items" , "exit_branch" ,  {type: Sequelize.STRING});
    queryInterface.addColumn("items" , "exit_branch_type" , {type: Sequelize.ENUM('regional-branch', 'sub-branch')});
    queryInterface.addColumn("items" , "current_hub" , {type: Sequelize.STRING});
    queryInterface.addColumn("items" , "next_hub" , {type: Sequelize.STRING});
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.removeColumn("items" , "entry_branch");
    queryInterface.removeColumn("items" , "entry_branch_type");
    queryInterface.removeColumn("items" , "exit_branch");
    queryInterface.removeColumn("items" , "exit_branch_type");
    queryInterface.removeColumn("items" , "current_hub");
    queryInterface.removeColumn("items" , "next_hub");
  }
};
