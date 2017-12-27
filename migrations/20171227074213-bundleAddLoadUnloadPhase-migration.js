'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.addColumn("bundles" , "phase" , {

      type: Sequelize.ENUM("load" , "unload"),
      defaultValue: null,
      allowNull: true
    })
    .then(function(){

      return queryInterface.addColumn("bundles" , "archived" , {

        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      })
    })
    .then(function(){

      return queryInterface.addIndex("bundles" , {
        name: "bundles_archived_phase",
        method: "BTREE",
        fields: ["archived" , "phase"]
      });
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface
          .removeIndex("bundles" , "bundles_archived_phase")
          .then(function(){
            return queryInterface.removeColumn("bundles" , "phase");
          })
          .then(function(){
            return queryInterface.removeColumn("bundles" , "archived");
          });
  }
};
