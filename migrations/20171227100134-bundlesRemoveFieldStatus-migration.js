'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.removeColumn("bundles" , "status");
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.addColumn("bundles" , "status" , {
      
      type: DataTypes.ENUM('draft','confirmed','ready','running','received','reached','forwarded','stocked','delivered','expired'),
      defaultValue: 'draft',
      allowNull: false
    });
  }
};
