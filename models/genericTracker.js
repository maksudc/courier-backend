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
module.exports = function(sequelize , DataTypes){

  var GenericTracker = sequelize.define("genericTracker" , {

      uuid: { type: DataTypes.UUID , primaryKey:true , defaultValue: DataTypes.UUIDV1 },
      trackableType: { type:DataTypes.ENUM('order' , 'orderItem' , 'shipment') , defaultValue:'order' , allowNull:false },
      trackableId:{ type:DataTypes.UUID , alowNull:false },
      status: { type: DataTypes.ENUM('active' , 'deactive') , defaultValue:"active" ,allowNull:true },
      currentGeoLocation: { type: DataTypes.GEOMETRY , allowNull:true },
      /*parentTrackerId: {

        type: DataTypes.UUID ,
        defaultValue: null,
        allowNull: true,
        references:{
          model: GenericTracker,
          key: "uuid"
        }
      },*/
      hasChild: { type: DataTypes.BOOLEAN , defaultValue: false }
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
        GenericTracker.hasMany(GenericTracker , { foreignKey:"parentTrackerId" });
      }
    }
  });

return GenericTracker;
};