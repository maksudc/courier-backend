'use strict';

var Promise = require("bluebird");
var codeUtils = require("../utils/codegen");
var codeConfig = require("../config/codeRange");

module.exports = function(sequelize , DataTypes){

  var GenericTracker = sequelize.define("genericTracker" , {

      uuid: { type: DataTypes.UUID , primaryKey:true , defaultValue: DataTypes.UUIDV1 },
      trackableType: { type:DataTypes.ENUM('order' , 'orderItem' , 'shipment') , defaultValue:'order' , allowNull:false },
      trackableId:{ type:DataTypes.UUID , alowNull:false },
      status: { type: DataTypes.ENUM('active' , 'deactive') , defaultValue:"active" ,allowNull:true },
      currentGeoLocation: { type: DataTypes.GEOMETRY , allowNull:true },

      hasChild: { type: DataTypes.BOOLEAN , defaultValue: false },

      currentBranchType: { type: DataTypes.ENUM( 'sub' , 'regional' ) , allowNull:true , defaultValue: null },
      currentBranchId:{ type: DataTypes.INTEGER },

      sourceBranchType: { type: DataTypes.ENUM( 'sub' , 'regional' ) , allowNull:true , defaultValue: null },
      sourceBranchId:{ type: DataTypes.INTEGER },

      destinationBranchType: { type: DataTypes.ENUM( 'sub' , 'regional' ) , allowNull:true , defaultValue: null },
      destinationBranchId:{ type: DataTypes.INTEGER },

      previousBranchType: { type: DataTypes.ENUM('regional' , 'sub' ) , allowNull:true , defaultValue: null },
      previousBranchId: { type: DataTypes.INTEGER },

      nextBranchType: { type: DataTypes.ENUM('regional' , 'sub' ) , allowNull:true , defaultValue: null },
      nextBranchId: { type: DataTypes.INTEGER },

      bar_code: {type: DataTypes.BIGINT, unique: true, allowNull: false, autoIncrement: true}

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

        GenericTracker.hasMany(models.trackerLog , { foreignKey: "trackerId" , name:"logsForTracker" , as:"logs" });

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
    },
    instanceMethods:{

      getBarcode: function(){
        return codeUtils.format(codeConfig.MAX_TRACKER_CODE_DIGIT , this.bar_code);
      }
    },
    indexes: [
      {
        name: "trackers_trackable",
        method: "BTREE",
        fields: ["trackableType" , "trackableId"]
      }
    ]
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
