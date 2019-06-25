'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addIndex("orders" ,   {
        name: "idx_order_payment_colns_indexes",
        method: "BTREE",
        fields: ["pay_time", "payment_hub_type", "payment_hub"]
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex("orders", "idx_order_payment_colns_indexes");
  }
};
