'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addColumn("businessPermissions", "createdAt", {
        allowNull: false,
        type: Sequelize.DATE
    })
    .then(function(){

      return queryInterface.addColumn("businessPermissions", "updatedAt", {
          allowNull: false,
          type: Sequelize.DATE
      });
    })
    .then(function(){

      return queryInterface.addColumn("userPermissions", "createdAt", {
          allowNull: false,
          type: Sequelize.DATE
      });
    })
    .then(function(){

      return queryInterface.addColumn("userPermissions", "updatedAt", {
          allowNull: false,
          type: Sequelize.DATE
      });
    });
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.removeColumn("businessPermissions", "createdAt")
    .then(function(){
      return queryInterface.removeColumn("businessPermissions", "updatedAt");
    })
    .then(function(){
      return queryInterface.removeColumn("userPermissions", "createdAt");
    })
    .then(function(){
      return queryInterface.removeColumn("userPermissions", "updatedAt");
    });
  }
};
