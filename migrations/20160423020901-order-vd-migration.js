'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    

      queryInterface.addColumn("money" , "money_order_id" , {

        type: Sequelize.UUID,
        allowNull: true
      }).then(function(){
        queryInterface.sequelize.query(
          " ALTER TABLE `money` ADD CONSTRAINT `money_ibfk_7` FOREIGN KEY (`money_order_id`) REFERENCES `orders` ( `uuid` ) ON DELETE SET NULL ON UPDATE CASCADE; "
        );
      });
  },

  down: function (queryInterface, Sequelize) {
    
    
      queryInterface.removeColumn("money" , "money_order_id").then(function(){
        queryInterface.sequelize.query(
          "ALTER TABLE `money` DROP FOREIGN KEY `money_ibfk_7`;"
        )
      });
    
  }
};