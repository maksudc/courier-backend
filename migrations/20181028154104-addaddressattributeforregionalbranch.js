'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
   return [
   queryInterface.addColumn("regionalBranches", "address", {
      type: Sequelize.STRING,
      default:null,
      allowNull:false
    }),
   ];
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
  },

  down: function (queryInterface, Sequelize) {
  return[
  queryInterface.removeColumn("regionalBranches","address"),

  ];
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
