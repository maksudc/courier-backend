'use strict';
module.exports = function (sequelize, DataTypes) {
    var branchTransactionHistory = sequelize.define('branchTransactionHistory', {
          id: {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: DataTypes.INTEGER
          },
          branch_type: {type:DataTypes.STRING,allowNull:false},
          branch_id: {type: DataTypes.INTEGER, allowNull: false},

          date_start: { type: DataTypes.DATE, allowNull:false },
          date_end: { type: DataTypes.DATE, allowNull:false },

          balance: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
          closing_balance: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},

          createdAt: {
              allowNull: false,
              type: DataTypes.DATE
          },
          updatedAt: {
              allowNull: false,
              type: DataTypes.DATE
          }
        },
        {

            classMethods: {
                associate: function (models) {

                }
            }
        })
    return branchTransactionHistory;
}
