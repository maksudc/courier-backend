var Promise = require("bluebird");
var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var shipment = sequelize.models.shipment;
var order = sequelize.models.order;

var createShipmentWithOrders = function(postData , next){

    shipmentBaseData = {
      name: postData.name,
      status: postData.status
    };
    var shipmentInstance = null;

    shipment
    .create(shipmentBaseData)
    .then(function(sInstance){

      shipmentInstance = sInstance;
      promises = [];
      for(I = 0 ; I< postData.orders.length ; I++ ){
          promises.push(order.findOne({ where: { uuid: postData.orders[I] } }));
      }
      //shipmentInstance

      return Promise.all(promises);
    })
    .then(function(results){

      promises = [];
      for(I = 0 ; I< results.length ; I++ ){
        promises.push(shipmentInstance.addOrders(results[I]));
      }
      return Promise.all(promises);
    })
    .then(function(results){

      console.log(results);
      next({ status:"success" , data: shipmentInstance });
    })
    .catch(function(err){
      console.log(err);
      next({ status:"error",  "message": JSON.stringify(err) });
    });
};

exports.createShipmentWithOrders = createShipmentWithOrders;
