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
  		type: DataTypes.ENUM('draft', 'confirmed', 'received', 'travelling', 'reached', 'delivered'),
  		defaultValue: 'draft',
  		allowNull: false
  	}

  } , {

    classMethods: {
      associate: function(models) {
        // associations can be defined here
        ShipmentModel.hasMany(models.order , {
          foreignKey: "shipmentUuid"
        });

        ShipmentModel.hasOne(models.genericTracker , {
          foreignKey: "trackableId",
          constraints: false,
          scope:{
            trackableType: 'shipment'
          }
        });
      }
    }
  });

  return ShipmentModel;
};
