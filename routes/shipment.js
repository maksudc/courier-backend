var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');
var shipmentLogic = require("../logics/shipmentLogic");

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/**
  @description Creates a new shipment from shipment Name
  @param name ( STRING ): name of the shipment , maybe auto generated based on date , random num and fixed string shipment
                          name can also incorporate source and destination names
  @param status ( Status ): current status of the shipment
  @param orders ( ARRAY ): collection of order ids in the same order they appeared on the system. Usually the order is determined by their
                           creation time .
                           It indicates the orders which will be included in this shipment process.
  @return res ( JSON ): {  'status'=> 'success'/'error', 'message'=>'' ,'data':newlyCreatedShipment  }

**/
router.post("/createWithOrders" , upload.array() , function(req , res){

  shipmentLogic.createShipmentWithOrders(req.body , function(data){
    if(!data){
      res.send({ status: "error" , message:"Something went wrong" });
    }
    res.send(data);
  });

});

module.exports = router
