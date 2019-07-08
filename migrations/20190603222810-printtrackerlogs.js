'use strict';
module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('printTrackerLogs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            uuid: {type:Sequelize.STRING,allowNull:false},
            print_no: {type: Sequelize.INTEGER, allowNull: false},
            print_type: {type: Sequelize.ENUM("item", "order"), allowNull: false},
            printed_by: {type: Sequelize.STRING, allowNull: true, defaultValue: null},
            printed_at:  {type: Sequelize.STRING, allowNull: true, defaultValue: null},

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
        return queryInterface.dropTable('printTrackerLogs');
    }
};
