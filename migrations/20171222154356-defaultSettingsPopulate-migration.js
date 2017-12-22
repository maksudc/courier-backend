'use strict';

var panicModeSiteSetting = require("./../config/siteSettings/panicModeDef");

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    panicModeSiteSetting["createdAt"] = new Date();
    panicModeSiteSetting["updatedAt"] = new Date();

    return queryInterface.bulkInsert("siteSettings" , [ panicModeSiteSetting ]);
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.bulkDelete("siteSettings" , { slug: panicModeSiteSetting.slug } );
  }
};
