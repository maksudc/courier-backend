'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

   return queryInterface.addColumn("manualTransactions","created_by",{
      type:Sequelize.STRING,
      allowNull:false,
    })
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.removeColumn("manualTransactions","created_by");
  }
};
