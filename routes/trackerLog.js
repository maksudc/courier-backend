var express = require("express");
var router = express.Router();
var trackerLogLogic = require("../logics/trackerLogLogic");

router.get("/" , function(req , res){

  trackerLogLogic.getTrackerLogs(function(data){
    res.send(data);
  });
});

router.get("/:id" , function(req , res){
  trackerLogLogic.getTrackerLogDetails(req.params.id , function(data){
    res.send(data);
  });
});

router.get("/tracker/:id" , function(req , res){
  trackerLogLogic.getTrackerLogsForTracker(req.params.id , function(data){
    res.send(data);
  });
});

module.exports = router;
