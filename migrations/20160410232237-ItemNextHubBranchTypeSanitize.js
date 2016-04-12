'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.changeColumn("items" ,"next_hub_type" , {
      type: Sequelize.STRING
    })
    .then(function(){
      return queryInterface.sequelize.query(" UPDATE items SET items.next_hub_type = 'regional' WHERE items.next_hub_type='regional-branch' ");
    })
    .then(function(){
      return queryInterface.sequelize.query(" UPDATE items SET items.next_hub_type = 'sub' WHERE items.next_hub_type='sub-branch' ");
    })
    .then(function(){
      return queryInterface.changeColumn("items" , "next_hub_type" , 	{type: Sequelize.ENUM('regional', 'sub')}); //Entry branch type);
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.changeColumn("items" ,"next_hub_type" , {
      type: Sequelize.STRING
    })
    .then(function(){
      return queryInterface.sequelize.query(" UPDATE items SET items.next_hub_type = 'regional-branch' WHERE items.next_hub_type='regional' ");
    })
    .then(function(){
      return queryInterface.sequelize.query(" UPDATE items SET items.next_hub_type = 'sub-branch' WHERE items.next_hub_type='sub' ");
    })
    .then(function(){
      return queryInterface.changeColumn("items" , "next_hub_type" , 	{type: Sequelize.ENUM('regional-branch', 'sub-branch')}); //Entry branch type);
    });
  }
};
