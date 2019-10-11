'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {

        return queryInterface.addColumn("manualTransactions", "expenditure_Type", {

            type: Sequelize.INTEGER,
            allowNull: true
        }).then(function () {
            queryInterface.sequelize.query(
                " ALTER TABLE `manualTransactions` ADD CONSTRAINT `expenditureTypeFK` FOREIGN KEY (`expenditure_Type`) REFERENCES `expenditureTypes` ( `id` ) ON DELETE SET NULL ON UPDATE CASCADE; "
            );
        });
    },

    down: function (queryInterface, Sequelize) {

        return queryInterface.removeColumn("manualTransactions", "expenditure_Type").then(function () {
            queryInterface.sequelize.query(
                "ALTER TABLE `manualTransactions` DROP FOREIGN KEY `expenditureTypeFK`;"
            )
        });

    }
};