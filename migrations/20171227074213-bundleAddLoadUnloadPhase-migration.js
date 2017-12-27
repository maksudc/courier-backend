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

      return queryInterface.addIndex("bundles" , {
        name: "bundles_phase",
        method: "BTREE",
        fields: ["phase"]
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
          .removeIndex("bundles" , "bundles_phase")
          .then(function(){
            return queryInterface.removeColumn("bundles" , "phase");
          });
  }
};
