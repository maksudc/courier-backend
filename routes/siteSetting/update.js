var express = require("express");
var router = express.Router();

var DB = require("./../../models");
var sequelize = DB.sequelize;
var siteSettingModel = sequelize.models.siteSetting;
var HttpStatus = require("http-status-codes");
var Promise = require("bluebird");
var panicModeDef = require("./../../config/siteSettings/panicModeDef");
var multer = require("multer");
var upload = multer();

router.post("/" , upload.array(), function(req , res){

  value = req.body.value;

  siteSettingModel
  .update({ value: value } , {
    where: { slug: req.body.slug }
  })
  .then(function(settingUpdateOpObj){
    return siteSettingModel.findOne({ where: { slug: req.body.slug } });
  })
  .then(function(settingObj){

    settingObj = settingObj || panicModeDef;
    settingObj["value"] = settingObj["value"] == "true";

    res.status(200);
    res.send(settingObj);
  })
  .catch(function(err){
    res.status(500);
    res.send(err);
  });
});

module.exports = router;
