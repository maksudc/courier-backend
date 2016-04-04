var Promise = require("bluebird");
var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var shipment = sequelize.models.shipment;
var order = sequelize.models.order;
var _=require("lodash");
var HttpStatus = require("http-status-codes");

var createShipmentWithOrders = function(postData , next){

    if( Object.keys(postData).length===0 || !postData.name || !postData.orders){
      next({ status:"error", statusCode:HttpStatus.BAD_REQUEST , message:"Name and orders are both needed" });
    }

    shipmentBaseData = {
      name: postData.name,
    };

    if(postData.status){
      _.assignIn(shipmentBaseData , { status: postData.status });
    }
    if(postData.shipmentType){
      _.assignIn(shipmentBaseData , { shipmentType:postData.shipmentType });
    }

    var shipmentInstance = null;

    var orders = JSON.parse(postData.orders);

    shipment
    .create(shipmentBaseData)
    .then(function(sInstance){

      shipmentInstance = sInstance;
      promises = [];
      for(I = 0 ; I< orders.length ; I++ ){
          promises.push(order.findOne({ where: { uuid: orders[I] } }));
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
      //console.log(results);
      next({ status:"success" , statusCode: HttpStatus.OK , data: shipmentInstance });
    })
    .catch(function(err){
      console.log(err);
      next({ status:"error", statusCode: HttpStatus.INTERNAL_SERVER_ERROR ,  "message": JSON.stringify(err) , data:null });
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
    limit: limit,
    where:{}
  };

  if(params.status){
    _.assignIn(queryOptions.where , { status: params.status } );
  }
  if(params.shipmentType){
    _.assignIn(queryOptions.where , { shipmentType: params.shipmentType } );
  }
  if(params.sourceBranchType){
    _.assignIn(queryOptions.where , { sourceBranchType: params.sourceBranchType } );
  }
  if(params.sourceBranchId){
    _.assignIn(queryOptions.where , { sourceBranchId: params.sourceBranchId } );
  }
  if(params.destinationBranchType){
    _.assignIn(queryOptions.where , { destinationBranchType: params.destinationBranchType } );
  }
  if(params.destinationBranchId){
    _.assignIn(queryOptions.where , { destinationBranchId: params.destinationBranchId } );
  }

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
    _.assignIn(queryParams.queryOptions.where , { uuid: shipmentId });

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

            next({ status:"success" , statusCode:HttpStatus.OK , data:data , message:null });
          });
        }else{

          data = {};
          _.assignIn(data , { shipment:shipmentInstance });
          _.assignIn(data , { orders:null });
          next({ status:"success", statusCode:HttpStatus.OK , data:data , message:null });
        }
      //}
    })
    .catch(function(err){
      next({ status:"error" , statusCode:HttpStatus.INTERNAL_SERVER_ERROR , message:err , data:null });
    });

};

var getShipments = function(params , next){

  queryParams = extractParams(params);

  var shipments = [];
  var datas =[];
  var reverseIndex = {};

  shipment
  .findAll(queryParams.queryOptions)
  .map(function(shipmentItem){

    if( params.includeOrders && parseInt(params.includeOrders) > 0){

      return order
      .findAll({ where: { shipmentUuid: shipmentItem.uuid } })
      .then(function(orders){

        data = {};
        if(orders && orders.length > 0){
          //console.log(datas.length + " Data are there  ");
          //console.log();
          _.assignIn(data , { shipment:shipmentItem });
          _.assignIn( data , { orders:orders });
          //datas.push(data);
          //console.log(JSON.stringify(data));
        }else{
          _.assignIn(data , { shipment: shipmentItem });
          _.assignIn( data , { orders:[] });
        }
        return data;
      });

    }else{

      data = {};
      _.assignIn(data , { shipment:shipmentItem });
      _.assignIn( data , { orders:null });

      return data;
    }
  })
  .then(function(results){
    //console.log(results);
    next({ status:"success" , statusCode:HttpStatus.OK , data:results , message:null });
  })
  .catch(function(err){
    console.log(err);
    next({ status:"error" , statusCode:HttpStatus.INTERNAL_SERVER_ERROR , data:null , message:err });
  });
  /*
  .then(function(results){

    shipments  = results;

    if( params.includeOrders && parseInt(params.includeOrders) > 0){

      return
      Promise
      .map(results , function(shipmentItem){

        return order
        .findAll({ where: { shipmentUuid: shipmentItem.uuid } })
        .then(function(orders){

          data = {};
          if(orders && orders.length > 0){

            index = reverseIndex[orders[0].shipmentUuid];
            console.log(index);
            //console.log(datas.length + " Data are there  ");
            //console.log();
            _.assignIn(data , { shipment:shipmentItem });
            _.assignIn( data , { orders:orders });
            //datas.push(data);
            console.log(JSON.stringify(data));
          }else{
            _.assignIn(data , { shipment: shipmentItem });
            _.assignIn( data , { orders:[] });
          }
          return data;
        })
      })
      .then(function(results){
        console.log(results);
        next({ status:"success" , statusCode:HttpStatus.OK , data:results , message:null });
      });

      ////
      promises = [];
      for(I = 0 ;I < results.length; I++){

        shipmentItem = results[I];

        //dataTemplate = {
        //  shipment: results[I] ,
        //  orders:[]
        //};
        //datas.push(dataTemplate);
        //
        reverseIndex[results[I].uuid] = I;

        orderPromise =
        order
        .findAll({ where: { shipmentUuid: results[I].uuid } })
        .then(function(orders){

          data = {};
          if(orders && orders.length > 0){

            index = reverseIndex[orders[0].shipmentUuid];
            console.log(index);
            //console.log(datas.length + " Data are there  ");
            //console.log();
            _.assignIn(data , { shipment: shipments[index] });
            _.assignIn( data , { orders:orders });
            //datas.push(data);
            console.log(JSON.stringify(data));
          }else{
            _.assignIn(data , { shipment: shipmentItem });
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

        next({ status:"success" , statusCode:HttpStatus.OK , data:results , message:null });
      })
      .catch(function(err){
        next({ status:"error" , statusCode:HttpStatus.INTERNAL_SERVER_ERROR , data:null, message:err });
      });
      //////

    }else{
      for(I = 0 ; I< results.length ; I++){
        datas.push({
          shipment: results[I],
          orders:null
        });
      }
      next({ status:"success" , statusCode:HttpStatus.OK ,  data:datas });
    }
  })
  .catch(function(err){
    console.log(err);
    next({ status:"error" , statusCode:HttpStatus.INTERNAL_SERVER_ERROR , data:null , message:err });
  });*/
};

var shipmentUpdate = function(shipmentId , postData , next){

  if( Object.keys(postData).length === 0 ){
    next({ status:"error" , statusCode: HttpStatus.BAD_REQUEST , message:"Empty data. Atleast one field must be changed to process." });
    return;
  }

  shipment.update(postData , {
    where: { uuid: shipmentId }
  })
  .then(function(result){
    next({ status:"success" , statusCode:HttpStatus.OK , data:result , message:null });
  })
  .catch(function(err){
    next({ status:"error" , statusCode:HttpStatus.INTERNAL_SERVER_ERROR , data:null , message: err });
  });
};

var exportToShipment = function( postData , next){

  startDate = postData.startDate;
  endDate = postData.endDate;
  branchType = postData.BranchType;
  branchId = postData.branchId;

  if(!startDate || !endDate || !branchType || !branchId ){
    next({ status:"error" , data:null , message:"Bad parameters" , params: postData });
  }

  order.findAll({
    where:{
      entry_branch_type: branchType + "-branch",
      entry_branch_id: branchId,
    },
    group:["order.exit_branch_type" , "order.exit_branch_id"]
  })
  .then(function(results){

  });
};


exports.createShipmentWithOrders = createShipmentWithOrders;
exports.getShipmentDetails = getShipmentDetails;
exports.getShipments = getShipments;
exports.exportToShipment = exportToShipment;
exports.shipmentUpdate = shipmentUpdate;
