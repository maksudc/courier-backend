var express = require("express");
var router = express.Router();
var trackerLogic = require("../logics/trackerLogic");

router.get("/" , function(req , res){

  trackerLogic.getTrackers(function(data){
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

module.exports = router;
