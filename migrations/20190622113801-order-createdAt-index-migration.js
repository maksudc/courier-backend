'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addIndex("orders" ,   {
        name: "idx_order_createdAt",
        method: "BTREE",
        fields: ["createdAt"]
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex("orders", "idx_order_createdAt");
  }
};
