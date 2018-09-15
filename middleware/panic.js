var DB = require("./../models");
var siteSettingModel = DB.sequelize.models.siteSetting;
var panicModeDef = require("./../config/siteSettings/panicModeDef");
var Promise = require("bluebird");

module.exports.addPanicSettingsHeaderIfApplicable = function(req,res,next){

  siteSettingModel
  .findOne({ where: { slug: panicModeDef["slug"] } })
  .then(function(settingObj){

    if( settingObj && settingObj.value == "true"){
      res.set(panicModeDef["slug"] , "true");
      req.headers[panicModeDef["slug"]] = "true";
    }
    next();
  })
  .catch(function(err){
    next(err);
  });
};

module.exports.blockIfPanicActivated = function(req,res,next){

  siteSettingModel
  .findOne({ where: { slug: panicModeDef["slug"] } })
  .then(function(settingObj){

    if( settingObj && settingObj.value == "true"){
      return Promise.reject(new Error("check site settings properly. invalid request at this setting"));
    }
    next();
  })
  .catch(function(err){
    next(err);
  });
};
