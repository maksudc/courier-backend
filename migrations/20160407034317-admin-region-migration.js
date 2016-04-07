'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.addColumn('admins', 'region_id', {
      type: Sequelize.INTEGER
    }).then(function(){

      queryInterface.sequelize.query(
         " ALTER TABLE `admins` ADD CONSTRAINT `admin_main_region_id` FOREIGN KEY (`region_id`) REFERENCES `regions` ( `id` ) ON DELETE SET NULL ON UPDATE CASCADE; "
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
    queryInterface.removeColumn('admins', 'region_id').then(function(){
      queryInterface.removeColumn("admins" , "region_id");
    });
  }
};