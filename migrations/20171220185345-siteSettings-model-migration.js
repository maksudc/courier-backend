'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.createTable("siteSettings" , {

      name: { type: Sequelize.STRING , allowNull: false },
      slug: { type: Sequelize.STRING , allowNull: false , unique: true },
      dtype: { type: Sequelize.ENUM( "string" , "int" , "json" ) , allowNull: false , defaultValue: "string" },
      value: { type: Sequelize.STRING , allowNull: true , defaultValue: null }
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.dropTable("siteSettings");
  }
};
