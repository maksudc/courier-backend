'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.createTable("userPermissions", {
      admin: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: "unique_user_permission"
      },
      business_permission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: "unique_user_permission"
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
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable("userPermissions");
  }
};
