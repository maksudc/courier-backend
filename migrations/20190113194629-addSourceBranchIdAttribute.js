'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return [
            queryInterface.addColumn("manualTransactions", "source_branch_id",
                {type: Sequelize.INTEGER, allowNull: true, defaultValue: 0})
        ]
    },

    down: (queryInterface, Sequelize) => {
        return [
            queryInterface.removeColumn("manualTransactions", "source_branch_id")
        ]
    }
};
