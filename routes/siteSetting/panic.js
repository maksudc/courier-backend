var express = require("express");
var router = express.Router();

var DB = require("./../../models");
var sequelize = DB.sequelize;
var siteSettingModel = sequelize.models.siteSetting;
var HttpStatus = require("http-status-codes");
var Promise = require("bluebird");
var panicModeDef = require("./../../config/siteSettings/panicModeDef");

router.get("/" , function(req , res){

  siteSettingModel
  .findOne({
    where: { slug: panicModeDef["slug"] },
    attributes: [ "slug" , "value" ]
  })
  .then(function(settingObj){

    // panicModeDef is the vanilla config which contains value='false' . That means by default is_panic mode is deactivated
    // If we find any entry in the database it will overwirte the default config
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
