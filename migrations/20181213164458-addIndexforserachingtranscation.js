'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addIndex("manualTransactions" ,   {
        name: "transaction_referrer_index",
        method: "BTREE",
        fields: ["payment_reference" , "payment_method"]
      });
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.removeIndex("manualTransactions", "transaction_referrer_index");
  }
};
