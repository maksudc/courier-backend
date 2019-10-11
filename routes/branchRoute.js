var express= require("express");
var branchRouteLogic = require("../logics/branchRouteLogic");
var RouteModel = require("../models/branchRoute");
var router = express.Router();
var multer = require("multer");
var upload = multer();

var bodyParser = require('body-parser');

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

router.get("/from/:sourceSubBranchId/to/:destinationSubBranchId" , function(req , res){

    branchRouteLogic.getFullRouteBetween(req.params.sourceSubBranchId , req.params.destinationSubBranchId , function(data){
       if(data){
           res.send(data);
       }else{
           res.send({ "status": "error" , data:data , "message": "error occured " });
       }
    });
});

router.get("/get" , function(req , res){

    branchRouteLogic.getRouteBetween(req.query.sourceBranchType , req.query.sourceBranchId , req.query.destinationBranchType , req.query.destinationBranchId , function(data){
       if(data){
           res.send(data);
       }else{
           res.send({ "status": "error" , data:data , "message": "error occured " });
       }
    });
});

router.post("/" , upload.array(), function(req , res){

  branchRouteLogic.newRoute(req.body , function(data){
    res.send(data);
  });

});

router.get("/$" , function(req , res){

  branchRouteLogic.getDefinedRoutes(function(data){

    if(data.statusCode){
      res.status(data.statusCode);
    }
    res.send(data);
  });
});


module.exports = router;
