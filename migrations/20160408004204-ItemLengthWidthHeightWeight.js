'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.addColumn("items" , "length" , {type: Sequelize.INTEGER});
    queryInterface.addColumn("items" , "width" , {type: Sequelize.INTEGER});
    queryInterface.addColumn("items" , "height" ,  {type: Sequelize.INTEGER});
    queryInterface.addColumn("items" , "weight" , {type: Sequelize.FLOAT});
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.removeColumn("items" , "length");
    queryInterface.removeColumn("items" , "width");
    queryInterface.removeColumn("items" , "height");
    queryInterface.removeColumn("items" , "weight");
  }
};
