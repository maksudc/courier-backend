'use strict';
/*var Sequelize = require("sequelize");
var BaseBranchModel = require("./baseBranch");

SubBranchModel = function(){};
SubBranchModel.prototype = Object.create(BaseBranchModel);

module.exports = SubBranchModel; */

module.exports = function(sequelize , DataTypes){

  var SubBranch = sequelize.define("subBranch" , {
      label: DataTypes.STRING,
      phone: DataTypes.STRING,
      address:DataTypes.STRING,
      branchType: DataTypes.STRING,
      position: DataTypes.GEOMETRY,
      enabled: { type: DataTypes.BOOLEAN , defaultValue: true , allowNull:false }
  } , {
    classMethods:{
      associate: function(models){

        SubBranch.belongsTo(models.regionalBranch , { foreignKey: "regionalBranchId" , as:"regionalBranch" });
        SubBranch.hasMany(models.genericTracker , {
          foreignKey: "currentBranchId",
          constraints: false,
          scope:{
            currentBranchType: "sub"
          },
          as: "currentTrackers"
        });

        SubBranch.hasMany(models.trackerLog , {
          foreignKey: "branchId",
          constraints: false,
          scope:{
            branchType: "regional"
          },
          as:"trackerLogs"
        });

        SubBranch.hasMany(models.shipment , {
          foreignKey: "sourceBranchId",
          constraints: false,
          scope:{
            branchType: "sub"
          },
          as:"sourcedShipment"
        });

        SubBranch.hasMany(models.shipment , {
          foreignKey: "destinationBranchId",
          constraints: false,
          scope:{
            branchType: "sub"
          },
          as:"destinedShipment"
        });

        SubBranch.belongsToMany(models.bundle , {
          as: 'destinedBundles',
          through: models.bundle_destination_subBranches,
          foreignKey: 'subBranchId',
          otherKey: 'bundleId'
        });

      }
    }
  });

  return SubBranch;
};
