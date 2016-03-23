'use strict';
/*var Sequelize  = require("sequelize");

RegionModel = {
    name: Sequelize.STRING
}

module.exports = RegionModel;*/

module.exports = function(sequelize , DataTypes){

  var RegionModel = sequelize.define('region' , {
      name: DataTypes.STRING
  } , {

    classMethods: {
        associate: function(models){
          RegionModel.hasMany(models.regionalBranch , { foreignKey: "regionId" });
        }
    }
  });

  return RegionModel;
};
