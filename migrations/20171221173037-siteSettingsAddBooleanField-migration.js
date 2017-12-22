'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.changeColumn("siteSettings" , "dtype" , {
      type: Sequelize.ENUM( "string" , "int" , "json" , "boolean" ) ,
      allowNull: false ,
      defaultValue: "string"
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.changeColumn("siteSettings" , "dtype" , {
      type: Sequelize.ENUM( "string" , "int" , "json") ,
      allowNull: false ,
      defaultValue: "string"
    });
  }
};
