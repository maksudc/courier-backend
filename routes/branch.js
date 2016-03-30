var express = require("express");
var router = express.Router();
var BranchController = require("../controllers/branch/BranchController");
var multer = require("multer");
var upload = multer();
var DB = require("../models/index");
var sequelize  = DB.sequelize;
var regionalBranch = sequelize.models.regionalBranch;
var subBranch = sequelize.models.subBranch;

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

router.get("/" , BranchController.index);

router.post("/regional" , upload.array() , function(req , res){

  postData = req.body;

  if(!postData.label){
    res.send({ status:"error" , data:null , message:"Label not specified" });
  }
  if(!postData.regonId){
    postData.regionId = null;
  }

  regionalBranch
  .create(postData)
  .then(function(result){
    res.send({ status:"success" , data:result , message:null });
  })
  .catch(function(err){
    res.send({ status:"error" , data:null , message:err });
  });
});

router.post("/sub" , upload.array() , function(req , res){

  postData = req.body;

  if(!postData.label){
    res.send({ status:"error" , data:null , message:"Label not specified" });
  }

  regionalBranch
  .create(postData)
  .then(function(result){
    res.send({ status:"success" , data:result , message:null });
  })
  .catch(function(err){
    res.send({ status:"error" , data:null , message:err });
  });
});

module.exports = router;
