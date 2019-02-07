'use strict';
module.exports = function (sequelize, DataTypes) {
    var userPermissions = sequelize.define('userPermission', {
      id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      admin: {
        type: DataTypes.STRING,
        allowNull: false
      },
      business_permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
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
            // userPermissions.belongsTo(models.admin, {foreignKey: 'admin'});
            // manualTransactions.belongsTo(models.businessPermission, {foreignKey: 'business_permission_id'});
        }
      }
    });
    return userPermissions;
}
