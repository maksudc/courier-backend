var express = require("express");
var router = express.Router();
var trackerLogic = require("../logics/trackerLogic");

router.get("/" , function(req , res){

  trackerLogic.getTracker
  res.send({ status:"success" });
});

module.exports = router
