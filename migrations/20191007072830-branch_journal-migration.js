'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.createTable('branchTransactionHistory', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        branch_type: {type:Sequelize.STRING,allowNull:false},
        branch_id: {type: Sequelize.INTEGER, allowNull: false},

        date_start: { type: Sequelize.DATE, allowNull:false },
        date_end: { type: Sequelize.DATE, allowNull:false },

        balance: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
        cumulative_balance: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},

        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
    });
  },

  down: function (queryInterface, Sequelize) {

      return queryInterface.dropTable('branchTransactionHistory');
  }
};
