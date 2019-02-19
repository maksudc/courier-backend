var express = require("express");
var router = express.Router();
var branchUtils = require("./../../utils/branch");
var DB = require("./../../models");
var sequelize = DB.sequelize;
var bundleModel = sequelize.models.bundle;
var HttpStatus = require("http-status-codes");
var Promise = require("bluebird");

var bodyParser = require('body-parser');
var multer = require("multer");
var upload = multer();

var Promise = require("bluebird");

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

router.post("/" , upload.array(), function(req , res){

  var bundleId = req.body.bundleId;
  var archivedStatus = req.body.archived;

  var bundleInstance = null;
  var branchesDatas = null;

  bundleModel
  .update({ archived: archivedStatus } , {
    where: {
      id:{ "$eq": bundleId }
    }
  })
  .then(function(result){
    res.status(HttpStatus.OK);
    res.send({ status: "success" , message: result });
  })
  .catch(function(err){
    if(err){
      console.error(err);
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR);
    res.send({ status:"error" , err: err });
  });
});

module.exports = router;
