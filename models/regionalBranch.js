'use strict';
/*var Sequelize  = require("sequelize");
var BaseBranchModel = require("./baseBranch");


RegionalBranchModel = function(){};
RegionalBranchModel.prototype = Object.create(BaseBranchModel);

module.exports = RegionalBranchModel;*/
module.exports = function(sequelize , DataTypes){

  var RegionalBranch = sequelize.define("regionalBranch" ,{
      label: DataTypes.STRING,
      branchType: DataTypes.STRING,
      position: DataTypes.GEOMETRY,
      enabled: { type: DataTypes.BOOLEAN , defaultValue: true , allowNull:false } 
  } , {

    classMethods: {
      associate: function(models){

        RegionalBranch.belongsTo(models.region ,{ foreignKey: "regionId" });
        RegionalBranch.hasMany(models.subBranch , { foreignKey: "regionalBranchId"  , as:"subBranches"});
        RegionalBranch.hasMany(models.branchRoute , { foreignKey: "sourceId" });
        RegionalBranch.hasMany(models.branchRoute , { foreignKey: "destinationId" });
        RegionalBranch.hasMany(models.genericTracker , {
          foreignKey: "currentBranchId",
          constraints: false,
          scope:{
            branchType: "regional"
          },
          as: 'currentTrackers'
        });

        RegionalBranch.hasMany(models.genericTracker , {
          foreignKey: "sourceBranchId",
          constraints: false,
          scope:{
            branchType: "regional"
          },
          as: 'sourceTrackers'
        });

        RegionalBranch.hasMany(models.genericTracker , {
          foreignKey: "destinationBranchId",
          constraints: false,
          scope:{
            branchType: "regional"
          },
          as: 'destinationTrackers'
        });

        RegionalBranch.hasMany(models.trackerLog , {
          foreignKey: "branchId",
          constraints: false,
          scope:{
            branchType: "regional"
          },
          as:"trackerLogs"
        });

        RegionalBranch.hasMany(models.shipment , {
          foreignKey: "sourceBranchId",
          constraints: false,
          scope:{
            branchType: "regional"
          },
          as:"sourcedShipment"
        });

        RegionalBranch.hasMany(models.shipment , {
          foreignKey: "destinationBranchId",
          constraints: false,
          scope:{
            branchType: "regional"
          },
          as:"destinedShipment"
        });
      }
    }
  });

  return RegionalBranch;
};
