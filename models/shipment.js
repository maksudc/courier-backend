'use strict';
/*var sequelize = require("./connect");
var Sequelize = require("sequelize");
var trackerModel = require("./genericTrackerModel");

ShipmentModel.sync();

module.exports = ShipmentModel;*/
var Promise = require("bluebird");
//var RouteLogic = require("../logics/branchRouteLogic");

module.exports = function(sequelize, DataTypes) {

  var ShipmentModel = sequelize.define("shipment" , {

    uuid: { type: DataTypes.UUID , primaryKey: true ,  defaultValue: DataTypes.UUIDV1 },
    name: { type: DataTypes.STRING , allowNull:true },
    // The status field for order and shipment are same , since the status shipment hold
    // will be applicable and replicated across all the order item inside the shipment
    status: {
  		type: DataTypes.ENUM('draft','confirmed','ready','running','received','reached','forwarded','stocked','delivered','expired'),
  		defaultValue: 'ready',
  		allowNull: false
  	},

    sourceBranchType: { type: DataTypes.ENUM('regional' , 'sub') , allowNull: false },
    sourceBranchId:{ type: DataTypes.INTEGER , allowNull:false },

    destinationBranchType:{ type: DataTypes.ENUM('regional', 'sub') , allowNull:false },
    destinationBranchId: { type: DataTypes.INTEGER , allowNull: false },

    currentBranchType: { type: DataTypes.ENUM('regional' , 'sub' ) , allowNull:true , defaultValue: null },
    currentBranchId: { type: DataTypes.INTEGER },

    previousBranchType: { type: DataTypes.ENUM('regional' , 'sub' ) ,allowNull:true , defaultValue: null },
    previousBranchId: { type: DataTypes.INTEGER },

    nextBranchType: { type: DataTypes.ENUM('regional' , 'sub' )  , allowNull:true , defaultValue: null },
    nextBranchId: { type: DataTypes.INTEGER },

    shipmentType:{ type: DataTypes.ENUM("local" , "national" , "international") , defaultValue:"national" },

    bar_code: {type: DataTypes.INTEGER, unique: true, allowNull: false, autoIncrement: true}

  } , {

    classMethods: {

      associate: function(models) {
        // associations can be defined here
        ShipmentModel.hasMany(models.order , {
          foreignKey: "shipmentUuid",
          as: "orders"
        });

        ShipmentModel.hasOne(models.genericTracker , {
          foreignKey: "trackableId",
          constraints: false,
          scope:{
            trackableType: 'shipment'
          },
          as: 'tracker'
        });

        ShipmentModel.belongsTo(models.regionalBranch , {
          foreignKey: "sourceBranchId",
          constraints: false,
          as: "sourceRegionalBranch"
        });
        ShipmentModel.belongsTo(models.regionalBranch , {
          foreignKey: "destinationBranchId",
          constraints: false,
          as: "sourceRegionalBranch"
        });

        ShipmentModel.belongsTo(models.subBranch , {
          foreignKey: "sourceBranchId",
          constraints: false,
          as: "sourceSubBranch"
        });
        ShipmentModel.belongsTo(models.subBranch , {
          foreignKey: "destinationBranchId",
          constraints: false,
          as: "sourceSubBranch"
        });
      }
    }
  });

  ShipmentModel.hook("afterCreate" , function(shipmentItem , options){

    shipmentItem
    .getTracker()
    .then(function(currentTrackerItem){
      if(!currentTrackerItem){

        var trackerData = {};
        trackerData.trackableType = "shipment";
        trackerData.trackableId = shipmentItem.uuid ;

        trackerData.sourceBranchType = shipmentItem.sourceBranchType;
        trackerData.sourceBranchId = shipmentItem.sourceBranchId;

        trackerData.destinationBranchType = shipmentItem.destinationBranchType;
        trackerData.destinationBranchId = shipmentItem.destinationBranchId;

        trackerData.currentBranchType = trackerData.sourceBranchType;
        trackerData.currentBranchId = trackerData.sourceBranchId;

        trackerData.previousBranchType = trackerData.sourceBranchType;
        trackerData.previousBranchId = trackerData.sourceBranchId;

        sequelize.models.genericTracker
        .create(trackerData)
        .then(function(trackerItem){

        });
      }
    });

  });

  ShipmentModel.hook("beforeDestroy" , function(shipmentItem , options){

    return
    shipmentItem
		.getTracker()
		.then(function(trackerItem){
			if(trackerItem){
					return trackerItem.destroy();
			}else{
				return ;
			}
		})
		.then(function(result){

		})
		.catch(function(err){
      if(err){
        console.error(err.stack);
      }
		});
	});

  return ShipmentModel;
};
