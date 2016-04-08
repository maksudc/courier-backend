'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.sequelize
    .query("ALTER TABLE  `trackerLogs` DROP PRIMARY KEY")
    .then(function(){

      return queryInterface.removeColumn("trackerLogs" , "uuid");
    })
    .then(function(){

      return queryInterface
      .addColumn("trackerLogs" , "uuid" , {
        type: Sequelize.UUID ,
        defaultValue: Sequelize.UUIDV1
      });
    })
    .then(function(){

      return queryInterface.sequelize
      .query("ALTER TABLE  `trackerLogs` ADD PRIMARY KEY (  `uuid` ) ");
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
