var Promise = require("bluebird");
var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var shipment = sequelize.models.shipment;
var order = sequelize.models.order;
var regionalBranch = sequelize.models.regionalBranch;
var subBranch = sequelize.models.subBranch;

var _=require("lodash");
var HttpStatus = require("http-status-codes");
var shipmentBarCodeConfig = require("../config/shipmentBarcode");
var commonUtils = require("../utils/common");


function prepareBarCode(shipmentInstance){

  if(!shipmentInstance){
    return ;
  }

  if(shipmentInstance.bar_code){

    barCode = shipmentInstance.bar_code + "";

    if( barCode.length < shipmentBarCodeConfig.MAX_LENGTH ){
      fillUpLength = shipmentBarCodeConfig.MAX_LENGTH - barCode.length;
      for(I = 0; I < fillUpLength ; I++){
        barCode = "0" + barCode;
      }
    }
    shipmentInstance.bar_code = barCode;
  }
  return ;
}

var ShipmentStatus = ['draft','confirmed','ready','running','received','reached','forwarded','stocked','delivered','expired'];

var unpackShipment = function(postData ,  next){

  var exitBranchType = postData.exitBranchType;
  var exitBranchId = postData.exitBranchId;

  var branchUtils = require("../utils/branch");

  var whereParams = {
    exit_branch_type: branchUtils.desanitizeBranchType(exitBranchType) ,
    exit_branch: exitBranchId,

    status: "reached"
  };

  order
  .findAll({ where: whereParams })
  .map(function(orderInstance){

    /*currentIndex = ShipmentStatus.indexOf(orderInstance.status);
    lastIndex = ShipmentStatus.indexOf('stocked');

    if(currentIndex < lastIndex){
        orderInstance.status = "running";
        return orderInstance.save();
    }*/

    orderInstance.status = "running";
    return orderInstance.save();

  })
  .then(function(results){
      next({ status:"success" , statusCode: HttpStatus.OK , message:null , data:results });
  })
  .catch(function(err){
    next({ status:"error" , statusCode:HttpStatus.INTERNAL_SERVER_ERROR , message:commonUtils.getErrorMessage(err) , data:null });
  });

  // shipment
  // .findOne({ where:{ uuid: shipmentId } })
  // .then(function(shipmentInstance){
  //
  //   if(!shipmentInstance){
  //     next({ status: "error" , statusCode:HttpStatus.NOT_FOUND , message:"Shipment Not found" , data:null });
  //     return;
  //   }
  //
  //   if(shipmentInstance.status != "reached" ){
  //     next({ status: "error" , statusCode:HttpStatus.FORBIDDEN , message:"Can not unpack unless it has reached the destination regional branch" , data:null });
  //     return;
  //   }
  //
  //   return shipmentInstance.getOrders();
  // })
  // .map(function(orderInstance){
  //
  //   currentIndex = ShipmentStatus.indexOf(orderInstance.status);
  //   lastIndex = ShipmentStatus.indexOf('stocked');
  //
  //   if(currentIndex < lastIndex){
  //     if(branchUtils.sanitizeBranchType(orderInstance.exit_branch_type) == sanitizeBranchType(exitBranchType) && orderInstance.exit_branch == exitBranchId){
  //       orderInstance.status = "running";
  //       return orderInstance.save();
  //     }
  //   }
  // })
  // .then(function(results){
  //     next({ status:"success" , statusCode: HttpStatus.OK , message:null , data:results });
  // })
  // .catch(function(err){
  //   next({ status:"error" , statusCode:HttpStatus.INTERNAL_SERVER_ERROR , message:JSON.stringify(err) , data:null });
  // });

};

var createShipmentWithOrders = function(postData , next){

  if( Object.keys(postData).length===0 || !postData.name || !postData.orders){
    next({ status:"error", statusCode:HttpStatus.BAD_REQUEST , message:"Name and orders are both needed" });
    return;
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
  if(postData.bar_code){
    _.assignIn(shipmentBaseData , { bar_code:postData.bar_code });
  }
  if(postData.sourceBranchType){
    _.assignIn(shipmentBaseData , { sourceBranchType:postData.sourceBranchType });
  }
  if(postData.sourceBranchId){
    _.assignIn(shipmentBaseData , { sourceBranchId:postData.sourceBranchId });
  }
  if(postData.destinationBranchType){
    _.assignIn(shipmentBaseData , { destinationBranchType:postData.destinationBranchType });
  }
  if(postData.destinationBranchId){
    _.assignIn(shipmentBaseData , { destinationBranchId:postData.destinationBranchId });
  }
  if(postData.currentBranchType){
    _.assignIn(shipmentBaseData , { currentBranchType:postData.currentBranchType });
  }else{
    //_.assignIn(shipmentBaseData , { currentBranchType:postData.sourceBranchType });
    shipmentBaseData.currentBranchType = shipmentBaseData.sourceBranchType;
  }
  if(postData.currentBranchId){
    _.assignIn(shipmentBaseData , { currentBranchId:postData.currentBranchId });
  }else{
    //_.assignIn(shipmentBaseData , { currentBranchType:postData.sourceBranchId });
    shipmentBaseData.currentBranchId = shipmentBaseData.sourceBranchId;
  }

  if(postData.previousBranchType){
    _.assignIn(shipmentBaseData , { previousBranchType:postData.previousBranchType });
  }else{
    shipmentBaseData.previousBranchType = shipmentBaseData.sourceBranchType;
  }

  if(postData.previousBranchId){
    _.assignIn(shipmentBaseData , { previousBranchId:postData.previousBranchId });
  }else{
    shipmentBaseData.previousBranchId = shipmentBaseData.sourceBranchId;
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

    return Promise.all(promises);
  })
  .then(function(results){

    promises = [];
    for(I = 0 ; I< results.length ; I++ ){
      promises.push(shipmentInstance.addOrders(results[I] , { individualHooks:true }));
    }
    return Promise.all(promises);
  })
  .then(function(results){
    //console.log(results);
    next({ status:"success" , statusCode: HttpStatus.OK , data: shipmentInstance });
  })
  .catch(function(err){
    console.log(err);
    next({ status:"error", statusCode: HttpStatus.INTERNAL_SERVER_ERROR ,  "message": commonUtils.getErrorMessage(err) , data:null });
  });
};

function extractParams(params){

  /*limit = 10;
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
  };*/

  queryOptions = {
    where:{}
  };

  if(params.status){
    _.assignIn(queryOptions.where , { status: params.status } );
  }
  if(params.shipmentType){
    _.assignIn(queryOptions.where , { shipmentType: params.shipmentType } );
  }

  if(params.bar_code){
    _.assignIn(queryOptions.where , { bar_code: params.bar_code });
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
  if(params.currentBranchId){
    _.assignIn(queryOptions.where , { currentBranchId: params.currentBranchId } );
  }
  if(params.currentBranchType){
    _.assignIn(queryOptions.where , { currentBranchType: params.currentBranchType } );
  }
  if(params.previousBranchId){
    _.assignIn(queryOptions.where , { previousBranchId: params.previousBranchId } );
  }
  if(params.previousBranchType){
    _.assignIn(queryOptions.where , { previousBranchType: params.previousBranchType } );
  }
  if(params.nextBranchId){
    _.assignIn(queryOptions.where , { nextBranchId: params.nextBranchId } );
  }
  if(params.nextBranchType){
    _.assignIn(queryOptions.where , { nextBranchType: params.nextBranchType } );
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

    prepareBarCode(shipmentInstance);

    var branchUtils = require("../utils/branch");

    if( params.includeOrders && parseInt(params.includeOrders) > 0){

      order
      .findAll({ where: { shipmentUuid:shipmentInstance.uuid } })
      .map(function(orderItem){

        entry_branch_type = branchUtils.sanitizeBranchType(orderItem.entry_branch_type);
        exit_branch_type = branchUtils.sanitizeBranchType(orderItem.exit_branch_type);

        entry_model = entry_branch_type == 'sub' ? subBranch: regionalBranch;
        exit_model = exit_branch_type == "sub" ? subBranch: regionalBranch;

        return entry_model
        .findOne({ where: { id: orderItem.entry_branch_id } })
        .then(function(branchItem){
          orderItem.entry_branch_obj = branchItem;
        })
        .then(function(){

          return exit_model.findOne({ where: { id: orderItem.exit_branch_id } } );
        })
        .then(function(branchItem){
          orderItem.exit_branch_obj = branchItem;
        })
        .then(function(){
          return orderItem;
        });
      })
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

    prepareBarCode(shipmentItem);

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
    where: { uuid: shipmentId },
    individualHooks: true
  })
  .then(function(result){
    updatedCount = 0;
    if(result && result.length > 1){
      updatedCount = result[0];
    }
    next({ status:"success" , statusCode:HttpStatus.OK , data:updatedCount , message:null });
  })
  .catch(function(err){
    console.error(err.stack);
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

var deleteShipment = function(shipmentId , params , next){

  queryParams = { where: { uuid: shipmentId  }};

  if(Object.keys(params).length > 0){
    _.assignIn(queryParams , params);
  }

  shipment
  .destroy(queryParams)
  .then(function(affectedRows){
    next({ status:"success" , statusCode:HttpStatus.OK , data:affectedRows , message:null });
  })
  .catch(function(err){
    next({ status:"error" , statusCode:HttpStatus.INTERNAL_SERVER_ERROR , message:err , data:null });
  });
};

/**
* If the resource is like:
resource = {
a:{
b:{
c:{
....
},
d:{
....
}
}
}
}
* Requires the parameter specified like:
[
{ "op": "test", "path": "/a/b/c", "value": "foo" },
{ "op": "remove", "path": "/a/b/c" },
{ "op": "add", "path": "/a/b/c", "value": [ "foo", "bar" ] },
{ "op": "replace", "path": "/a/b/c", "value": 42 },
{ "op": "move", "from": "/a/b/c", "path": "/a/b/d" },
{ "op": "copy", "from": "/a/b/d", "path": "/a/b/e" }
]
See the following link for details:
* http://williamdurand.fr/2014/02/14/please-do-not-patch-like-an-idiot/

* For adding orders to shipment
[
{
"op":"add" , "path":"/orders" , value:["orderUuid1" , "orderuuid2"]
}
]
* For removing orders from shipment
[
{
"op":"remove" , "path":"/orders" , value:["orderUuid1" , "orderuuid2"]
}
]
* For cleaning the shipment from orders
[
{
"op":"replace" , "path":"/orders" , value:[]
}
]
**/
var manageShipmentOrders = function(shipmentId , params , next){

  var paramList = params;

  console.log(params);
  console.log(typeof(params));

  shipment
  .findOne({ where: { uuid: shipmentId } })
  .then(function(shipmentItem){

    console.log(" Shipment Uuid:  " + shipmentItem.uuid);

    if(!paramList || Object.keys(paramList).length===0){
      next({ status:"error" , statusCode:HttpStatus.BAD_REQUEST , message:"Atleast one change is required" });
      return null;
    }

    return Promise.map(paramList , function(paramObject){

      console.log("Processing : ");
      console.log(paramObject);

      if(paramObject.path == "/orders"){

        if(paramObject.op === "add"){
          // add the values to the list
          return order
          .findAll({ where:{ uuid:paramObject.value } })
          .map(function(orderItem){
            console.log("Adding Order: " + orderItem.uuid + " to "+ "shipment: " + shipmentItem.uuid);
            shipmentItem.addOrders(orderItem);
          });

        }
        else if(paramObject.op=="remove"){

          return order
          .findAll({ where:{ uuid:paramObject.value } })
          .map(function(orderItem){
            console.log("Removing Order: " + orderItem.uuid + " from "+ "shipment: " + shipmentItem.uuid);
            shipmentItem.removeOrders(orderItem);
          });

        }else if(paramObject.op=="replace"){

          return shipmentItem
          .setOrders([])
          .then(function(){

            if(paramObject.value && Object.keys(paramObject.value).length > 0){

              return order
              .findAll({ where:{ uuid:paramObject.value } })
              .map(function(orderItem){
                console.log("adding orders on replacement: " + orderItem.uuid + " To " + shipmentItem.uuid);
                shipmentItem.addOrders(orderItem);
              });
            }
          });
        }
      }else{

        return Promise.reject("only order is currently processed. So please try with path = `/orders`");
      }
    });
  })
  .then(function(results){
    //console.log(results);

    if(results){
      next({ status:"success" , statusCode:HttpStatus.OK , data:null , message:null });
    }
  })
  .catch(function(err){
    next({ status:"error" , statusCode:HttpStatus.INTERNAL_SERVER_ERROR , data:null , message:err  });
  });
};

var exportShipment = function(shipmentUuid , params , next ){

  var resultData = {};
  resultData.orders = {};
  resultData.items = {};

  resultData.orders.count = 0;
  resultData.items.count = 0;

  var orderCache = {};

  return shipment
  .findOne({ where: { uuid: shipmentUuid } })
  .then(function(shipmentInstance){

    resultData.shipmentUuid = shipmentInstance.uuid;
    return shipmentInstance.getOrders();
  })
  .map(function(orderInstance){

    resultData.orders[orderInstance.bar_code] = {
      verified: false,
      uuid: orderInstance.uuid
    };

    orderCache[orderInstance.uuid] = orderInstance.bar_code;

    return orderInstance.getItems();
  })
  .map(function(itemInstances){

    resultData.items.count = resultData.items.count + itemInstances.length ;
    return Promise.map(itemInstances , function(itemInstance){

      resultData.items[itemInstance.bar_code] = {
        orderUuid: itemInstance.orderUuid,
        orderBarcode: orderCache[itemInstance.orderUuid],
        verified: false
      };

     });
  })
  .then(function(results){

    resultData.orders.count =  results.length;

    if(next){
      next({ status: "success" , statusCode: HttpStatus.OK , data: resultData , message: null });
    }
    return Promise.resolve(resultData);
  });
};

exports.createShipmentWithOrders = createShipmentWithOrders;
exports.getShipmentDetails = getShipmentDetails;
exports.getShipments = getShipments;
exports.exportToShipment = exportToShipment;
exports.shipmentUpdate = shipmentUpdate;
exports.deleteShipment = deleteShipment;
exports.manageShipmentOrders = manageShipmentOrders;
exports.unpackShipment = unpackShipment;
exports.exportShipment = exportShipment;
