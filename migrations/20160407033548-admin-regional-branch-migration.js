'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.addColumn('admins', 'regional_branch_id', {
      type: Sequelize.INTEGER
    }).then(function(){

      queryInterface.sequelize.query(
         " ALTER TABLE `admins` ADD CONSTRAINT `admin_regional_id` FOREIGN KEY (`regional_branch_id`) REFERENCES `regionalBranches` ( `id` ) ON DELETE SET NULL ON UPDATE CASCADE; "
      );

    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.removeColumn('admins', 'regional_branch_id').then(function(){
      queryInterface.removeColumn("admins" , "regional_branch_id");
    });
  }
};