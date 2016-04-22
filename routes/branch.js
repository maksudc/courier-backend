var express = require("express");
var router = express.Router();
var BranchController = require("../controllers/branch/BranchController");
var multer = require("multer");
var upload = multer();
var DB = require("../models/index");
var sequelize  = DB.sequelize;
var regionalBranch = sequelize.models.regionalBranch;
var subBranch = sequelize.models.subBranch;
var passport = require('passport');
var bodyParser = require('body-parser');

var branchLogic = require("../logics/branchLogic");

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var passport = require('passport');
var middleware = require(process.cwd() + '/middleware');


router.use(passport.authenticate('basic', {session: false}));
router.use(middleware.checkPermission);

router.post("/regional$" , upload.array() , function(req , res){

  postData = req.body;

  if(!postData.label){
    res.send({ status:"error" , data:null , message:"Label not specified" });
    return;
  }
  if(!postData.regionId){
    postData.regionId = null;
  }

  postData.branchType = "regional";

  regionalBranch
  .create(postData)
  .then(function(result){
    res.send({ status:"success" , data:result , message:null });
  })
  .catch(function(err){
    res.send({ status:"error" , data:null , message:err });
  });
});

router.post("/sub$" , upload.array() , function(req , res){

  postData = req.body;

  if(!postData.label){
    res.send({ status:"error" , data:null , message:"Label not specified" });
    return;
  }

  postData.branchType = "sub";
  subBranch
  .create(postData)
  .then(function(result){
    res.send({ status:"success" , data:result , message:null });
  })
  .catch(function(err){
    res.send({ status:"error" , data:null , message:err });
  });
});

router.get("/:branchType" , function(req , res){

  branchLogic.getBranches(req.params.branchType , req.query , function(data){
    if(data.statusCode){
      res.status(data.statusCode);
    }
    res.send(data);
  });
});

router.get("/:branchType/:branchId" , function(req , res){

  branchLogic.getBranch(req.params.branchType ,req.params.branchId , function(data){
    if(data.statusCode){
      res.status(data.statusCode);
    }
    res.send(data);
  });
});

router.put("/:branchType/:branchId" , upload.array() , function(req , res){

  branchLogic.updateBranch(req.params.branchType , req.params.branchId , req.body , function(data){
    if(data.statusCode){
      res.status(data.statusCode);
    }
    res.send(data);
  });
});

router.delete("/:branchType/:branchId" , upload.array() , function(req , res){

  branchLogic.deleteBranch(req.params.branchType , req.params.branchId , function(data){
    if(data.statusCode){
      res.status(data.statusCode);
    }
    res.send(data);
  });
});

router.get("/$" , BranchController.index);

module.exports = router;
