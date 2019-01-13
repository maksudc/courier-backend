'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return [
            queryInterface.addColumn("manualTransactions", "instructed_by",
                {type: Sequelize.STRING, allowNull: true, defaultValue: null})
        ]
    },

    down: (queryInterface, Sequelize) => {
        return [
            queryInterface.removeColumn("manualTransactions", "instructed_by")
        ]
    }
};
