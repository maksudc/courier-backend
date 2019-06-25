'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addIndex("orders" ,   {
        name: "idx_sender",
        method: "BTREE",
        fields: ["sender","createdAt"]
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex("orders", "idx_sender");
  }
};
