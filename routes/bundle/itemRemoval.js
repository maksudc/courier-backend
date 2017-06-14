var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer();
var DB = require("./../../models/index");
var sequelize  = DB.sequelize;
var itemModel = sequelize.models.item;
var bundleModel = sequelize.models.bundle;

var HttpStatus = require("http-status-codes");
var bodyParser = require('body-parser');

var branchUtils = require("./../../utils/branch");
var Promise = require("bluebird");

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

router.delete("/" , upload.array() , function(req , res){

  var itemBarCode = req.body.bar_code;
  var bundleId = req.body.bundleId;

  var bundleInstance = null;
  var itemInstance = null;

  bundleModel
  .findOne({
    where: {
      id: bundleId
    }
  })
  .then(function(bundleObj){
    bundleInstance = bundleObj;
  })
  .then(function(){
    return itemModel.findOne({
      where:{
        bar_code: itemBarCode,
        bundleId: bundleId
      }
    });
  })
  .then(function(itemobj){
    itemInstance = itemobj;
  })
  .then(function(){
    if(!bundleInstance){
      return Promise.reject({ code: HttpStatus.BAD_REQUEST ,  message: "Bundle does not exist" });
    }
    else if(!itemInstance){
      return Promise.reject({ code: HttpStatus.BAD_REQUEST ,  message: "Item Does not exist Within Bundle" });
    }
  })
  .then(function(){
    return bundleInstance.removeAttachedItems(itemInstance);
  })
  .then(function(){

    itemData = itemInstance;

    res.status(HttpStatus.OK);
    res.send({ "status":"success" , item: itemData });
  })
  .catch(function(err){
    if(err){
      console.error(err);
    }
    if(err && err.code){
      res.status(err.code);
    }else{
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
    }
    res.send({ status: "error" , error: err });
  });

});

module.exports = router;
