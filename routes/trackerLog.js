var express = require("express");
var router = express.Router();
var trackerLogLogic = require("../logics/trackerLogLogic");

router.get("/" , function(req , res){

  trackerLogLogic.getTrackerLogs(req.query , function(data){
    res.send(data);
  });
});

router.get("/:id" , function(req , res){
  trackerLogLogic.getTrackerLogDetails(req.params.id , req.query , function(data){
    res.send(data);
  });
});

router.get("/tracker/:id" , function(req , res){
  trackerLogLogic.getTrackerLogsForTracker(req.params.id , req.query, function(data){
    res.send(data);
  });
});

router.get("/for/order" , function(req , res){

  trackerLogLogic.getTrackerLogsForOrder(req.query , function(data){

    if(data.statusCode){
      res.status(data.statusCode);
    }
    res.send(data);
  });
});

module.exports = router;
