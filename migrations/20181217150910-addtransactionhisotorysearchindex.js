'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {

        return queryInterface.addIndex("manualTransactions", {
            name: "transaction_history_index",
            method: "BTREE",
            fields: ["createdAt", "updatedAt"]
        });
    },

    down: function (queryInterface, Sequelize) {

        return queryInterface.removeIndex("manualTransactions", "transaction_history_index");
    }
};
