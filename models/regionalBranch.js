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
      position: DataTypes.GEOMETRY
  } , {

    classMethods: {
      associate: function(models){

        RegionalBranch.belongsTo(models.region ,{ foreignKey: "regionId" });
        RegionalBranch.hasMany(models.subBranch , { foreignKey: "regionalBranchId" });
      }
    }
  });

  return RegionalBranch;
};
