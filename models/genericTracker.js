'use strict';
/*
var Sequelize = require("sequelize");
var sequelize = require("./connect");

var GenericTracker = sequelize.define("genericTracker" , {

    uuid: { type: Sequelize.UUID , primaryKey:true , defaultValue: Sequelize.UUIDV1 },
    trackableType: { type:Sequelize.ENUM('order' , 'orderItem' , 'shipment') , defaultValue:'order' , allowNull:false },
    trackableId:{ type:Sequelize.UUID , alowNull:false },
    status: { type: Sequelize.ENUM('active' , 'deactive') , defaultValue:"active" ,allowNull:true },
    currentGeoLocation: { type: Sequelize.GEOMETRY , allowNull:true },
    parentTrackerId: {

      type: Sequelize.UUID ,
      defaultValue: null,
      allowNull: true,
      references:{
        model: GenericTracker,
        key: "uuid"
      }
    },
    hasChild: { type: Sequelize.BOOLEAN , defaultValue: false }
});

GenericTracker.sync();

module.exports = GenericTracker;
*/
var Promise = require("bluebird");

module.exports = function(sequelize , DataTypes){

  var GenericTracker = sequelize.define("genericTracker" , {

      uuid: { type: DataTypes.UUID , primaryKey:true , defaultValue: DataTypes.UUIDV1 },
      trackableType: { type:DataTypes.ENUM('order' , 'orderItem' , 'shipment') , defaultValue:'order' , allowNull:false },
      trackableId:{ type:DataTypes.UUID , alowNull:false },
      status: { type: DataTypes.ENUM('active' , 'deactive') , defaultValue:"active" ,allowNull:true },
      currentGeoLocation: { type: DataTypes.GEOMETRY , allowNull:true },

      hasChild: { type: DataTypes.BOOLEAN , defaultValue: false },
      currentBranchType: { type: DataTypes.ENUM( 'sub' , 'regional' ) , defaultValue:'regional' },
      currentBranchId:{ type: DataTypes.INTEGER },

      sourceBranchType: { type: DataTypes.ENUM( 'sub' , 'regional' ) , defaultValue:'regional' },
      sourceBranchId:{ type: DataTypes.INTEGER },

      destinationBranchType: { type: DataTypes.ENUM( 'sub' , 'regional' ) , defaultValue:'regional' },
      destinationBranchId:{ type: DataTypes.INTEGER },

      previousBranchType: { type: DataTypes.ENUM('regional' , 'sub' ) },
      previousBranchId: { type: DataTypes.INTEGER },

      nextBranchType: { type: DataTypes.ENUM('regional' , 'sub' ) },
      nextBranchId: { type: DataTypes.INTEGER },

  } , {

    classMethods: {
      associate: function(models){

        GenericTracker.belongsTo(models.shipment , {
          foreignKey: "trackableId",
          constraints: false,
          as: 'shipment'
        });
        GenericTracker.belongsTo(models.order , {
          foreignKey: "trackableId",
          constraints: false,
          as: 'order'
        });
        GenericTracker.belongsTo(models.item , {
          foreignKey: "trackableId",
          constraints: false,
          as: 'orderItem'
        });

        GenericTracker.belongsTo(GenericTracker , { foreignKey:"parentTrackerId" , as:'parentTracker' });
        GenericTracker.hasMany(GenericTracker , { foreignKey:"parentTrackerId" , as:'childTrackers' });

        GenericTracker.hasMany(models.trackerLog , { foreignKey: "trackerId" , name:"logsForTracker" });

        GenericTracker.belongsTo(models.regionalBranch , {
          foreignKey: "currentBranchId",
          constraints: false,
          as: 'regionalBranch'
        });

        GenericTracker.belongsTo(models.subBranch , {
          foreignKey: "currentBranchId",
          constraints: false,
          as: 'subBranch'
        });

        GenericTracker.belongsTo(models.regionalBranch , {
          foreignKey: "sourceBranchId",
          constraints: false,
          as: 'sourceRegionalBranch'
        });

        GenericTracker.belongsTo(models.subBranch , {
          foreignKey: "sourceBranchId",
          constraints: false,
          as: 'sourceSubBranch'
        });

        GenericTracker.belongsTo(models.regionalBranch , {
          foreignKey: "destinationBranchId",
          constraints: false,
          as: 'destinationRegionalBranch'
        });

        GenericTracker.belongsTo(models.subBranch , {
          foreignKey: "destinationBranchId",
          constraints: false,
          as: 'destinationSubBranch'
        });

      }
    }
  });

  GenericTracker.hook("beforeDestroy" , function(trackerInstance , options){

    if(trackerInstance.parentTrackerId){

      GenericTracker
      .findAll({ where: { parentTrackerId: trackerInstance.parentTrackerId } })
      .then(function(siblingTrackersInclusive){

        if(siblingTrackersInclusive.length === 0){

          return GenericTracker.findOne({ where: { uuid: trackerInstance.parentTrackerId } });
        }else{
          return Promise.resolve(null);
        }
      })
      .then(function(parentTrackerInstance){

        if(parentTrackerInstance){

          return parentTrackerInstance.update({
            hasChild: false
          });
        }
      })
      .then(function(result){
        console.log(result);
      })
      .catch(function(err){
        console.log(err);
      });

    }
  });

  return GenericTracker;
};
