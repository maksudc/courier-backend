'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return [
            queryInterface.addColumn("manualTransactions", "source_branch_type",
                {type: Sequelize.ENUM("regional","sub"), allowNull: true, defaultValue:null})
        ]
    },

    down: (queryInterface, Sequelize) => {
        return [
            queryInterface.removeColumn("manualTransactions", "source_branch_type")
        ]
    }
};
