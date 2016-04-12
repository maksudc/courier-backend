'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.changeColumn("orders" , "status" , {
			type: Sequelize.ENUM('draft','confirmed','ready','running','received','reached','forwarded','stocked','delivered','expired'),
			defaultValue: 'ready',
			allowNull: false
		});
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.changeColumn("orders" , "status" , {
			type: Sequelize.ENUM('draft','confirmed','ready','running','received','reached','forwarded','stocked','delivered','expired'),
			defaultValue: 'draft',
			allowNull: false
		});
  }
};
