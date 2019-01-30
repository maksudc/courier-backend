'use strict';
module.exports = function (sequelize, DataTypes) {
    var businessPermissions = sequelize.define('businessPermissions', {
      id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    });
    return businessPermissions;
}
