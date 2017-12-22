var DB = require("./../models");
var siteSettingModel = DB.sequelize.models.SiteSetting;
var panicModeDef = require("./../config/siteSettings/panicModeDef");

module.exports = function(req,res,next){

  siteSettingModel
  .findOne({ where: { slug: panicModeDef.slug } })
  .then(function(settingObj){

    if( settingObj && settingObj.value == "true"){
      res.set(panicModeDef.slug , "true");
    }
    next();
  })
  .catch(function(err){
    next(err);
  });
};
