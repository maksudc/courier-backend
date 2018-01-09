var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer();
var DB = require("./../../models/index");
var bundleUtils = require('./../../utils/bundle');
var sequelize  = DB.sequelize;
var itemModel = sequelize.models.item;
var bundleModel = sequelize.models.bundle;

var HttpStatus = require("http-status-codes");
var bodyParser = require('body-parser');

var branchUtils = require("./../../utils/branch");
var Promise = require("bluebird");
var passport = require("passport");

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.use(passport.authenticate('basic', {session: false}));

router.post("/" , upload.array() , function(req , res){

  var itemBarCode = req.body.bar_code;
  var bundleId = req.body.bundleId;

  var bundleInstance = null;
  var itemInstance = null;
  var orderInstance = null;

  sequelize.transaction(function(t){

    return bundleModel
    .findOne({
      where: {
        id: bundleId
      },
      transaction: t
    })
    .then(function(bundleObj){
      bundleInstance = bundleObj;
    })
    .then(function(){
      return itemModel.findOne({
        where:{ bar_code: itemBarCode },
        transaction: t
      });
    })
    .then(function(itemobj){
      itemInstance = itemobj;
    })
    .then(function(){
      if(!bundleInstance){
        return Promise.reject({ code: HttpStatus.BAD_REQUEST ,  message: "Bundle does not exist" });
      }else if(!itemInstance){
        return Promise.reject({ code: HttpStatus.BAD_REQUEST ,  message: "Item Does not exist" });
      }
    })
    .then(function(){
        return itemInstance.getOrder({
          attributes: [ "uuid" , "status" , "bar_code" ]
        });
    })
    .then(function(orderObj){

      orderInstance = orderObj;
      if(bundleUtils.isApplicableOrderForBundleProcessing(orderInstance.status)){
        return Promise.reject({ code: HttpStatus.LOCKED ,  message: "Item belonging to the order is locked" });
      }
    })
    .then(function(){
        return bundleInstance.getDestinationSubBranches({
          where: {
            id: itemInstance.exit_branch,
            branchType: itemInstance.exit_branch_type
          }
        });
    })
    .then(function(checkBranchInstance){
      if(!checkBranchInstance || !checkBranchInstance.length){
        return Promise.reject({ code: HttpStatus.PRECONDITION_FAILED , message: "This item does not belong to bundle"  });
      }
    })
    .then(function(){
      return bundleInstance.addAttachedItems(itemInstance);
    })
    .then(function(result){
      return branchUtils.getInclusiveBranchInstance(itemInstance.entry_branch_type , itemInstance.entry_branch);
    })
    .then(function(entrybranchInstance){
      itemInstance.entryBranch = entrybranchInstance;
    })
    .then(function(){
      return branchUtils.getInclusiveBranchInstance(itemInstance.exit_branch_type , itemInstance.exit_branch);
    })
    .then(function(exitBranchInstance){
      itemInstance.exitBranch = exitBranchInstance;
    })
    .then(function(){

      itemData = {};
      itemData["bar_code"] = itemInstance.bar_code;
      itemData["entry_branch_label"] = itemInstance.entryBranch.label;
      if(itemInstance.entryBranch.regionalBranch){
        itemData["entry_branch_label"] = itemData["entry_branch_label"] + ","+ itemInstance.entryBranch.regionalBranch.label;
      }
      itemData["exit_branch_label"] = itemInstance.exitBranch.label;
      if(itemInstance.exitBranch.regionalBranch){
        itemData["exit_branch_label"] = itemData["exit_branch_label"] + "," + itemInstance.exitBranch.regionalBranch.label;
      }

      res.status(HttpStatus.OK);
      res.send({ "status":"success" , item: itemData });
    })
    .then(function(){

      var scanActivityModel = require("./../../models").sequelize.models.scanActivity;
    });
  })
  .then(function(result){

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
