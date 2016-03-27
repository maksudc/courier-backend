var express= require("express");
var branchRouteLogic = require("../logics/branchRouteLogic");
var RouteModel = require("../models/branchRoute");
var router = express.Router();
var multer = require("multer");
var upload = multer();

router.get("/from/:sourceSubBranchId/to/:destinationSubBranchId" , function(req , res){

    //console.log(req.params.sourceSubBranchId);
    //console.log(req.params.destinationSubBranchId);

    branchRouteLogic.getFullRouteBetween(req.params.sourceSubBranchId , req.params.destinationSubBranchId , function(data){
       if(data){
           res.send(data);
       }else{
           res.send({ "status": "error" , data:data , "message": "error occured " });
       }
    });
});

router.post("/" , function(req , res){

  branchRouteLogic.newRoute(req.body , function(data){
    res.send(data);
  });

});

module.exports = router;
