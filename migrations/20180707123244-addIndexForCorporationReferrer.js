'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addIndex("corporations" ,   {
        name: "corporation_referrer_index",
        method: "BTREE",
        fields: ["referrer_type" , "referrer_identifier"]
      });
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.removeIndex("corporations", "corporation_referrer_index");
  }
};
