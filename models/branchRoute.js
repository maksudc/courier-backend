'use strict';
/*var Sequelize = require("sequelize");
var sequelize = require("./connect");

var BranchRoute = sequelize.define("branchRoute",{
    //uuid: { type: Sequelize.UUID , primaryKey:true , defaultValue:Sequelize.UUIDV1 },
    midNodes: { type: Sequelize.STRING , allowNull:true },
    sourceId:{
        type: Sequelize.INTEGER,
        references:{
            model: sequelize.RegionalBranch,
            key: "id"
        },
    },
    destinationId:{
        type: Sequelize.INTEGER,
        references:{
            model: sequelize.RegionalBranch,
            key: "id"
        }
    }
});

BranchRoute.sync();

module.exports = BranchRoute;*/
module.exports = function(sequelize , DataTypes){

  var BranchRoute = sequelize.define("branchRoute",{
      //uuid: { type: Sequelize.UUID , primaryKey:true , defaultValue:Sequelize.UUIDV1 },
      midNodes: { type: DataTypes , allowNull:true },
      /*sourceId:{
          type: Sequelize.INTEGER,
          references:{
              model: sequelize.RegionalBranch,
              key: "id"
          },
      },
      destinationId:{
          type: Sequelize.INTEGER,
          references:{
              model: sequelize.RegionalBranch,
              key: "id"
          }
      }*/
  } , {

    classMethods: {
      associate: function(models){

        BranchRoute.belongsTo(models.regionalBranch , { foreignKey: 'sourceId' });
        BranchRoute.belongsTo(models.regionalBranch , { foreignKey: 'destinationId' });
      }
    }
  });

  return BranchRoute;
};
