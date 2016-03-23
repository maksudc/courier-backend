var Promise = require("bluebird");
var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var shipment = sequelize.models.shipment;
var order = sequelize.models.order;
var _=require("lodash");

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
      next({ status:"error",  "message": JSON.stringify(err) , data:null });
    });
};

function extractParams(params){

  limit = 10;
  if(params.limit){
    limit = parseInt(params.limit);
  }
  pageNo = 1;
  if(params.pageNo){
    pageNo = parseInt(params.pageNo);
  }

  offset = (pageNo-1) * limit;

  queryOptions = {
    offset: offset,
    limit: limit
  };

  assoc = null;
  includeOrders =  0;
  if(includeOrders){
    includeOrders = parseInt(params.includeOrders);
  }
  if(includeOrders > 0){
    assoc = true;
  }
  return {queryOptions:queryOptions , assoc:assoc};
}

var getShipmentDetails = function(shipmentId , params , next){

    queryParams = extractParams(params);
    queryParams.queryOptions.where = { uuid: shipmentId };

    var shipmentInstance = null;

    shipment
    .findOne( queryParams.queryOptions )
    .then(function(sInstance){
      //if(shipmentInstance){
        console.log(params);
        console.log(queryParams.asoc);

        shipmentInstance = sInstance;

        if( params.includeOrders && parseInt(params.includeOrders) > 0){

          order
          .findAll({ where: { shipmentUuid:shipmentInstance.uuid } })
          .then(function(orders){

            console.log("Total " + orders.length + "Orders Found");

            data = {};
            _.assignIn(data , { shipment: shipmentInstance } );
            _.assignIn(data , { orders:orders }  );

            next({ status:"success" , data:data , message:null });
          });
        }else{

          data = {};
          _.assignIn(data , { shipment:shipmentInstance });
          _.assignIn(data , { orders:null });
          next({ status:"success" , data:data , message:null });
        }
      //}
    })
    .catch(function(err){
      next({ status:"error" , message:err , data:null });
    });

};

var getShipments = function(params , next){

  queryParams = extractParams(params);

  var shipments = [];
  var datas =[];
  var reverseIndex = {};

  shipment
  .findAll(queryParams.queryOptions)
  .then(function(results){

    shipments  = results;

    if( params.includeOrders && parseInt(params.includeOrders) > 0){

      promises = [];
      for(I = 0 ;I < results.length; I++){

        shipmentItem = results[I];

        /*dataTemplate = {
          shipment: results[I] ,
          orders:[]
        };
        datas.push(dataTemplate);
        */
        reverseIndex[results[I].uuid] = I;

        orderPromise =
        order
        .findAll({ where: { shipmentUuid: shipmentItem.uuid } })
        .then(function(orders){

          data = {};
          if(orders && orders.length > 0){

            index = reverseIndex[orders[0].shipmentUuid];
            console.log(index);
            //console.log(datas.length + " Data are there  ");
            //console.log();
            _.assignIn(data , { shipment: results[index] });
            _.assignIn( data , { orders:orders });
            //datas.push(data);
            console.log(JSON.stringify(data));
          }
          return data;
        })
        .catch(function(err){
          console.log(err);
        });

        promises.push(orderPromise);
      }

      console.log(results.length + "  shipment are in the system total");

      Promise
      .all(promises)
      .then(function(results){
        next({ status:"success" , data:results , message:null });
      })
      .catch(function(err){
        next({ status:"error" , data:null, message:err });
      });

    }else{
      for(I = 0 ; I< results.length ; I++){
        datas.push({
          shipment: results[I],
          orders:null
        });
      }
      next({ status:"success" , data:datas });
    }
  })
  .catch(function(err){
    console.log(err);
    next({ status:"error" , data:null , message:err });
  });
};

exports.createShipmentWithOrders = createShipmentWithOrders;
exports.getShipmentDetails = getShipmentDetails;
exports.getShipments = getShipments;
