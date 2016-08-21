var twilioConfig = require("./twilio");
var banglaPhoneConfig = require("./banglaPhone");
var sslwirelessConfig = require("./sslwireless");

var env = null;
if(!process.env.NODE_ENV){
  env = "development";
}else{
  env = process.env.NODE_ENV;
}

var config = {};

var BACKEND_NAME = sslwirelessConfig.BACKEND_NAME;
//var BACKEND_NAME = banglaPhoneConfig.BACKEND_NAME;
//var BACKEND_NAME = twilioConfig.BACKEND_NAME;

if(BACKEND_NAME == banglaPhoneConfig.BACKEND_NAME){
  config = banglaPhoneConfig.config;
}else if(BACKEND_NAME == sslwirelessConfig.BACKEND_NAME){
  config = sslwirelessConfig.config;
}else{
  config = twilioConfig.config;
}

var config_env = config[env];

var getGatewayUrl = function(){

  if(BACKEND_NAME == banglaPhoneConfig.BACKEND_NAME){
    return banglaPhoneConfig.getGatewayUrl(config_env);
  }else if(BACKEND_NAME == sslwirelessConfig.BACKEND_NAME){
    return sslwirelessConfig.getGatewayUrl(config_env);
  }else{
    return twilioConfig.getGatewayUrl(config_env);
  }
};

var getProtocol = function(){

  if(BACKEND_NAME == sslwirelessConfig.BACKEND_NAME){
    return sslwirelessConfig.getProtocol();
  }else{
    return "https";
  }
};

var prepareRequest = function(data){

  if(BACKEND_NAME == banglaPhoneConfig.BACKEND_NAME){
    return banglaPhoneConfig.prepareRequest(config_env , data);
  }else if(BACKEND_NAME == sslwirelessConfig.BACKEND_NAME){
    return sslwirelessConfig.prepareRequest(config_env , data);
  }else{
    return twilioConfig.prepareRequest(config_env , data);
  }
};

module.exports.BACKEND_NAME = BACKEND_NAME;
module.exports.config = config_env;
module.exports.getGatewayUrl = getGatewayUrl;
module.exports.prepareRequest = prepareRequest;
module.exports.getProtocol = getProtocol;
