'use strict';
module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('manualTransaction', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            amount: {type: Sequelize.DECIMAL, allowNull: false, defaultValue: 0},
            branch_type: {type: Sequelize.STRING, allowNull: false},
            branch_id: {type: Sequelize.INTEGER, allowNull: false},
            status: {type: Sequelize.ENUM("draft", "received", "archived"), allowNull: false, defaultValue: "draft"},
            recieved_by: {type: Sequelize.STRING, allowNull: true, defaultValue: null},
            recieved_at: {type: Sequelize.DATE, allowNull: true, defaultValue: null},
            transaction_type: {type: Sequelize.ENUM("cashin", "cashout"), allowNull: true,},
            payment_method:{type:Sequelize.ENUM("bank","bkash","direct"),allowNull:true,},
            payment_reference:{type:Sequelize.STRING,allowNull:true},
            payment_description:{type:Sequelize.STRING,allowNull:true},
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
        return queryInterface.dropTable('manualTransaction');
    }
};
