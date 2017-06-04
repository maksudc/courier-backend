var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer();
var DB = require("./../../models/index");
var sequelize  = DB.sequelize;
var bundleModel = sequelize.models.bundle;
var subBranchModel = sequelize.models.subBranch;

var passport = require('passport');
var bodyParser = require('body-parser');
var HttpStatus = require("http-status-codes");

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

router.post("/$" , upload.array() , function(req , res){

  var bundleInstance = null;
  var postData = req.body;
  console.log(postData);

  // banchIds = [];
  // if(postData["destinationBranchIds"]){
  //   if(typeof(postData["destinationBranchIds"])=="string"){
  //     try{
  //         banchIds = JSON.parse(postData["destinationBranchIds"]) || [];
  //     }catch(err){
  //         console.err(err);
  //     }
  //   }else {
  //     branchIds = postData["destinationBranchIds"];
  //   }
  // }
  //postData["destinationBranchIds"] = branchIds;

  branchIds = postData["destinationBranchIds"] || [];
  if(!branchIds.length){
    res.status(HttpStatus.BAD_REQUEST);
    res.send({ status:"error" , err:"one sub branch must be selected." });
    return;
  }

  postData["destinationBranchIds"] = branchIds;

  bundleModel
  .create(postData)
  .then(function(bundleObject){
    bundleInstance = bundleObject;
  })
  .then(function(){
    return bundleInstance.addDestinationSubBranches(postData["destinationBranchIds"]);
  })
  .then(function(result){

    res.status(HttpStatus.OK);
    res.send({ status:"success" , data: bundleInstance });
  })
  .catch(function(err){
    console.error(err);
    if(err){
      err.stack();
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR);
    res.send({ status:"error" , error: err.message });
  });
});

module.exports = router;
