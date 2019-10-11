'use strict';
module.exports = function (sequelize, DataTypes) {
    var manualTransactions = sequelize.define('manualTransactions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            amount: {type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0},
            branch_type: {type: DataTypes.STRING, allowNull: false},
            branch_id: {type: DataTypes.INTEGER, allowNull: false},
            status: {type: DataTypes.ENUM("draft", "received", "archived"), allowNull: false, defaultValue: "draft"},
            received_by: {type: DataTypes.STRING, allowNull: true, defaultValue: null},
            received_at: {type: DataTypes.DATE, allowNull: true, defaultValue: null},
            transaction_type: {type: DataTypes.ENUM("cashin", "cashout"), allowNull: true,},
            payment_method: {type: DataTypes.ENUM("bank", "bkash", "direct"), allowNull: true,},
            payment_reference: {type: DataTypes.STRING, allowNull: true},
            payment_description: {type: DataTypes.STRING, allowNull: true},
            created_by: {type: DataTypes.STRING, allowNull: false},
            updated_by: {type: DataTypes.STRING, allowNull: true},
            expenditure_Type: {type: DataTypes.STRING, allowNull: false},
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE
            },
            source_branch_id: {type: DataTypes.INTEGER, allowNull: true, defaultValue: 0},
            source_branch_type: {type: DataTypes.ENUM("regional", "sub"), allowNull: true, defaultValue: null},
            instructed_by: {type: DataTypes.STRING, allowNull: true, defaultValue: null}
        },
        {

            classMethods: {
                associate: function (models) {
                    manualTransactions.belongsTo(models.admin, {foreignKey: 'received_by'});
                    manualTransactions.belongsTo(models.admin, {foreignKey: 'updated_by'});
                    manualTransactions.belongsTo(models.admin, {foreignKey: 'created_by'});
                    manualTransactions.belongsTo(models.expenditureTypes, {foreignKey: 'expenditure_Type'});

                }
            }
        })
    return manualTransactions;
}
