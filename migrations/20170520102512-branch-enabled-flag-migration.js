'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.addColumn('subBranches' , 'enabled' , {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    })
    .then(function(){
      return queryInterface.addColumn('regionalBranches' , 'enabled' ,{
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
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
    return queryInterface.removeColumn('subBranches' , 'enabled')
    .then(function(){
      return queryInterface.removeColumn('regionalBranches' , 'enabled');
    });
  }
};
