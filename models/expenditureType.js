'use strict';
module.exports = function (sequelize, DataTypes) {
    var expenditureType = sequelize.define('expenditureTypes', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            name:
                {
                    type: DataTypes.STRING,
                    allowNull: false
                },
            createdBy:
                {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            updatedBy: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            createdAt: {
                allowNull: true,
                type: DataTypes.DATE
            },
            updatedAt: {
                allowNull: true,
                type: DataTypes.DATE
            }
        },
        {

            classMethods: {}
        })
    return expenditureType;
}
