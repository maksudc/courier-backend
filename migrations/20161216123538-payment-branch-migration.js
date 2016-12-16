'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.addColumn("orders" , "payment_hub_type" , {
      type: Sequelize.ENUM('regional', 'sub') ,
      allowNull: true
    }).then(function(){

      return queryInterface.addColumn("orders" , "payment_hub",{
        type: Sequelize.STRING,
        allowNull:true
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
    .removeColumn("orders" , "payment_hub_type")
    .then(function(){
      return queryInterface.removeColumn("orders" , "payment_hub");
    });
  }
};
