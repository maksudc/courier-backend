'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.sequelize.query(
       " ALTER TABLE `orders` ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`shipmentUuid`) REFERENCES `shipments` ( `uuid` ) ON DELETE SET NULL ON UPDATE CASCADE; "
    )
    .then(function(){

      queryInterface.addColumn("orders" , "shipmentUuid" , {

        type: Sequelize.UUID,
        allowNull: true,
        references:{
          model: "shipments",
          key: "uuid"
        }
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
    queryInterface.sequelize.query(
      "ALTER TABLE `orders` DROP FOREIGN KEY `orders_ibfk_1`;"
    ).then(function(){
      queryInterface.removeColumn("orders" , "shipmentUuid");
    });

  }
};
