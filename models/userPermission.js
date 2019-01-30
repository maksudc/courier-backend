'use strict';
module.exports = function (sequelize, DataTypes) {
    var userPermissions = sequelize.define('userPermissions', {
      admin: {
        type: DataTypes.STRING,
        allowNull: false
      },
      business_permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      classMethods: {
        associate: function (models) {
            manualTransactions.belongsTo(models.admin, {foreignKey: 'admin'});
            manualTransactions.belongsTo(models.businessPermission, {foreignKey: 'business_permission_id'});
        }
      }
    });
    return userPermissions;
}
