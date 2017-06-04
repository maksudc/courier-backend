var express = require("express");
var router = express.Router();
var DB = require("./../../models");
var sequelize = DB.sequelize;
var bundleModel = sequelize.models.bundle;
var HttpStatus = require("http-status-codes");

router.get("/:id" , function(req , res){

  bundleModel
  .findOne({
    where: {
      id:{ "$eq": req.params.id }
    }
  })
  .then(function(bundleInstance){
    res.status(HttpStatus.OK);
    res.send({
      status: "success",
      data: bundleInstance
    });
  })
  .catch(function(err){
    if(err){
      console.error(err);
      err.stack();
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR);
    res.send({ status:"error" , err: err });
  });
});

module.exports = router;
