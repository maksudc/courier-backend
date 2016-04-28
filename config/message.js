var twilioConfig = require("./twilio");
var banglaPhoneConfig = require("./banglaPhone");

var env = null;
if(!process.env.NODE_ENV){
  env = "development";
}else{
  env = process.env.NODE_ENV;
}

var config = {};

var BACKEND_NAME = banglaPhoneConfig.BACKEND_NAME;
//var BACKEND_NAME = twilioConfig.BACKEND_NAME;

if(BACKEND_NAME == banglaPhoneConfig.BACKEND_NAME){
  config = banglaPhoneConfig.config;
}else{
  config = twilioConfig.config;
}

var config_env = config[env];

var getGatewayUrl = function(){

  if(BACKEND_NAME == banglaPhoneConfig.BACKEND_NAME){
    return banglaPhoneConfig.getGatewayUrl(config_env);
  }else{
    return twilioConfig.getGatewayUrl(config_env);
  }
};

var prepareRequest = function(data){

  if(BACKEND_NAME == banglaPhoneConfig.BACKEND_NAME){
    return banglaPhoneConfig.prepareRequest(config_env , data);
  }else{
    return twilioConfig.prepareRequest(config_env , data);
  }
};

module.exports.BACKEND_NAME = BACKEND_NAME;
module.exports.config = config_env;
module.exports.getGatewayUrl = getGatewayUrl;
module.exports.prepareRequest = prepareRequest;
