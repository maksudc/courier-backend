'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addIndex("clients" ,   {
        name: "client_referrer_index",
        method: "BTREE",
        fields: ["referrer_type" , "referrer_identifier"]
      });
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.removeIndex("clients", "client_referrer_index");
  }
};
