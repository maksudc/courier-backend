'use strict';

module.exports = function(sequelize, DataTypes) {
  var scanActivity = sequelize.define('scanActivity', {
    activityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model:{
          tableName: "activities"
        },
        key: "id"
      }
    },
    bundleId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model:{
          tableName: "bundles"
        },
        key: "id"
      }
    },
    responseCode: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {

        scanActivity.belongsTo(models.activity , { foreignKey: "activityId" , as:"activity" });
        scanActivity.belongsTo(models.bundle , { foreignKey: "bundleId" , as:"bundle" });
      }
    }
  });
  return scanActivity;
};
