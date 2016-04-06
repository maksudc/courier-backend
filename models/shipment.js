'use strict';
/*var sequelize = require("./connect");
var Sequelize = require("sequelize");
var trackerModel = require("./genericTrackerModel");

ShipmentModel.sync();

module.exports = ShipmentModel;*/
module.exports = function(sequelize, DataTypes) {

  var ShipmentModel = sequelize.define("shipment" , {

    uuid: { type: DataTypes.UUID , primaryKey: true ,  defaultValue: DataTypes.UUIDV1 },
    name: { type: DataTypes.STRING , allowNull:true },
    // The status field for order and shipment are same , since the status shipment hold
    // will be applicable and replicated across all the order item inside the shipment
    status: {
  		type: DataTypes.ENUM('draft','confirmed','ready','running','received','reached','forwarded','stocked','delivered','expired'),
  		defaultValue: 'draft',
  		allowNull: false
  	},
    sourceBranchType: { type: DataTypes.ENUM('regional' , 'sub') },
    sourceBranchId:{ type: DataTypes.INTEGER },

    destinationBranchType:{ type: DataTypes.ENUM('regional', 'sub') },
    destinationBranchId: { type: DataTypes.INTEGER },

    shipmentType:{ type: DataTypes.ENUM("local" , "national" , "international") , defaultValue:"national" }

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

        sequelize.models.genericTracker
        .create(trackerData)
        .then(function(trackerItem){

          console.log(" Tracker Attached to shipment with uuid:  " + trackerItem.uuid);
        });
      }
    });

  });

  ShipmentModel.hook("beforeDestroy" , function(shipmentItem , options){

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
			console.log(result);
		})
		.catch(function(err){
			console.log(err);
		});
	});

  return ShipmentModel;
};
