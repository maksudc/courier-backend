'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return [
            queryInterface.addColumn("subBranches", "vd_disabled", {
                type: Sequelize.BOOLEAN,
                default: false,
                allowNull: false
            }),
            queryInterface.addColumn("regionalBranches", "vd_disabled", {
                type: Sequelize.BOOLEAN,
                default: false,
                allowNull: false
            }),

        ];
        /*
          Add altering commands here.
          Return a promise to correctly handle asynchronicity.

          Example:
          return queryInterface.createTable('users', { id: Sequelize.INTEGER });
        */
    },

    down: function (queryInterface, Sequelize) {
        return [
            queryInterface.removeColumn("subBranches", "vd_disabled"),
            queryInterface.removeColumn("regionalBranches", "vd_disabled"),

        ];
        /*
          Add reverting commands here.
          Return a promise to correctly handle asynchronicity.

          Example:
          return queryInterface.dropTable('users');
        */
    }
};
