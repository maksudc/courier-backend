'use strict';
module.exports = function (sequelize, DataTypes) {
    var printTrackerLogs = sequelize.define('printTrackerLogs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            uuid:{type:DataTypes.STRING,allowNull:false},
            print_no: {type: DataTypes.INTEGER, allowNull: false},
            print_type: {type: DataTypes.ENUM("item", "order"), allowNull: false},
            printed_by: {type: DataTypes.STRING, allowNull: true, defaultValue: null},
            printed_at: {type: DataTypes.STRING, allowNull: true, defaultValue: null},

            createdAt: {
                allowNull: false,
                type: DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE
            }

        },
        {})


    return printTrackerLogs;
}

