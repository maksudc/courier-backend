'use strict';
/*var Sequelize = require("sequelize");
var BaseBranchModel = require("./baseBranch");

SubBranchModel = function(){};
SubBranchModel.prototype = Object.create(BaseBranchModel);

module.exports = SubBranchModel; */

module.exports = function(sequelize , DataTypes){

  var SubBranch = sequelize.define("subBranch" , {
      label: DataTypes.STRING,
      branchType: DataTypes.STRING,
      position: DataTypes.GEOMETRY
  } , {
    classMethods:{
      associate: function(models){

        SubBranch.belongsTo(models.regionalBranch , { foreignKey: "regionalBranchId" });
        SubBranch.hasMany(models.genericTracker , {
          foreignKey: "currentBranchId",
          constraints: false,
          scope:{
            currentBranchType: "sub"
          },
          as: "currentTrackers"
        });
      }
    }
  });

  return SubBranch;
};
