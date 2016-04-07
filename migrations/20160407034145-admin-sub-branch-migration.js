'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.addColumn('admins', 'sub_branch_id', {
      type: Sequelize.INTEGER
    }).then(function(){

      queryInterface.sequelize.query(
         " ALTER TABLE `admins` ADD CONSTRAINT `admin_sub_id` FOREIGN KEY (`sub_branch_id`) REFERENCES `subBranches` ( `id` ) ON DELETE SET NULL ON UPDATE CASCADE; "
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
    queryInterface.removeColumn('admins', 'sub_branch_id').then(function(){
      queryInterface.removeColumn("admins" , "sub_branch_id");
    });
  }
};