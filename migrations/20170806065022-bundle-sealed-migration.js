'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    queryInterface.addColumn("bundles" , "sealed" , {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  down: function (queryInterface, Sequelize) {

    queryInterface.removeColumn("bundles" , "sealed");
  }
};
