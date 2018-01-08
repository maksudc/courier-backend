'use strict';

module.exports = function(sequelize, DataTypes) {
  var scanActivity = sequelize.define('scanActivity', {
    bundleId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model:{
          tableName: "bundles"
        },
        key: "id",
        onDelete: "cascade",
        onUpdate: "cascade"
      }
    },
    responseCode: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {

        scanActivity.belongsTo(models.bundle , { foreignKey: "bundleId" , as:"bundle" });
      }
    }
  });
  return scanActivity;
};
