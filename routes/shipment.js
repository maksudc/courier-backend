var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');
var shipmentLogic = require("../logics/shipmentLogic");
var HttpStatus = require("http-status-codes");

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


router.delete("/:id" , upload.array() , function(req , res){

    shipmentLogic.deleteShipment(req.params.id  , req.body , function(data){
      if(data.statusCode){
        res.status(data.statusCode);
      }
      res.send(data);
    });
});

/**
  @description Update a shipment from shipment Name
  @param name ( STRING ): name of the shipment , maybe auto generated based on date , random num and fixed string shipment
                          name can also incorporate source and destination names
  @param status ( Status ): current status of the shipment
  @param orders ( JSON_ARRAY ): collection of order ids in the same order they appeared on the system. Usually the order is determined by their
                           creation time .
                           It indicates the orders which will be included in this shipment process.
  @return res ( JSON ): {  'status'=> 'success'/'error', 'message'=>'' ,'data':newlyCreatedShipment  }

**/
router.put("/:id" , upload.array() , function(req , res){

    shipmentLogic.shipmentUpdate(req.params.id , req.body , function(data){
      if(data.statusCode){
        res.status(data.statusCode);
      }
      res.send(data);
    });
});

/**
  @description Creates a new shipment from shipment Name
  @param name ( STRING ): name of the shipment , maybe auto generated based on date , random num and fixed string shipment
                          name can also incorporate source and destination names
  @param status ( Status ): current status of the shipment
  @param shipmentType (STRING): local/national/international
  @param orders ( JSON_ARRAY ): collection of order ids in the same order they appeared on the system. Usually the order is determined by their
                           creation time .
                           It indicates the orders which will be included in this shipment process.
  @return res ( JSON ): {  'status'=> 'success'/'error', 'message'=>'' ,'data':newlyCreatedShipment  }

**/
router.post("/" , upload.array() , function(req , res){

  shipmentLogic.createShipmentWithOrders(req.body , function(data){
    if(data.statusCode){
      res.status(data.statusCode);
    }
    res.send(data);
  });
});

/**
  @param id ( UUID ) required: uuid of the shipment to retrieve
  @param ?limit ( INTEGER ) : customizable limit for pagination
            default: 10
  @param ?pageNo ( INETEGER ): pageNo after limit which needs to be fetched ( 1 based indexing )
            default: 1
  @param ?includeOrders ( BOOLEAN ): whether or not to include orders in nested manner for each shipment result
            default: false
  @return response ( JSONObject ):
            status ( STRING ): "success"/"error",
            data ( JSONObject ): shipment model structure
            message ( STRING ): if error happened it contains the details of the error
**/
router.get("/:id" , function(req , res){

  queryVars = req.query;
  //console.log(queryVars);
  shipmentLogic.getShipmentDetails(req.params.id , queryVars , function(data){
    if(data.statusCode){
      res.status(data.statusCode);
    }
    res.send(data);
  });
});

/**
  @param id ( UUID ) required: uuid of the shipment to retrieve
  @param ?limit ( INTEGER ) : customizable limit for pagination
            default: 10
  @param ?pageNo ( INETEGER ): pageNo after limit which needs to be fetched ( 1 based indexing )
            default: 1
  @param ?status (STRING)
  @param ?sourceBranchType (STRING)
  @param ?sourceBranchId (INTEGER)
  @param ?destinationBranchType (STRING)
  @param ?destinationBranchId (INTEGER)
  @param ?includeOrders ( BOOLEAN ): whether or not to include orders in nested manner for each shipment result
            default: false
  @return response ( JSONObject ):
            status ( STRING ): "success"/"error",
            data ( JSONArray ): shipment model structure
            message ( STRING ): if error happened it contains the details of the error
**/
router.get("/" , function(req , res){

  queryVars = req.query;
  console.log(queryVars);

  shipmentLogic.getShipments(queryVars , function(data){
    if(data.statusCode){
      res.status(data.statusCode);
    }
    res.send(data);
  });
});

router.post("/export" , function(req , res){

});

module.exports = router;
