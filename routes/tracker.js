var express = require("express");
var router = express.Router();
var trackerLogic = require("../logics/trackerLogic");

router.get("/" , function(req , res){

  trackerLogic.getTrackers(req.query , function(data){
      res.send(data);
  });
});

router.get("/:id" , function(req , res){

  trackerLogic.getTracker(req.params.id , function(data){
    res.send(data);
  });
});

router.get("/:id/currentBranch" , function(req ,res){
  trackerLogic.getTrackerCurrentBranch(req.params.id , function(data){
    res.send(data);
  });
});

router.put("/:id/currentBranch" , function(req , res){
  trackerLogic.updateCurrentLocation(req.params.id , req.body.branchType , req.body.branchId , function(data){
    res.send(data);
  });
});

router.post("/" , function(req , res){
  trackerLogic.createTracker(req.body , function(data){
    res.send(data);
  });
});

module.exports = router;
