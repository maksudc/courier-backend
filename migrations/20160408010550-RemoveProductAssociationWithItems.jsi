'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.sequelize.query(
      //" ALTER TABLE `items` ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`productUuid`) REFERENCES `products` ( `uuid` ) ON DELETE SET NULL ON UPDATE CASCADE; "
      "ALTER TABLE `items` DROP FOREIGN KEY `items_ibfk_1`;"
    )
    .then(function(){
      return queryInterface.removeColumn("items" , "productUuid");
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.addColumn("items" , "productUuid" , {
      type: Sequelize.UUID,
    })
    .then(function(){
      queryInterface.sequelize.query(
        " ALTER TABLE `items` ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`productUuid`) REFERENCES `products` ( `uuid` ) ON DELETE SET NULL ON UPDATE CASCADE; "
      );
    });
  }
};
