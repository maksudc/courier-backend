var urlUtils = require('url');

var config = {
  'test':{
   "USER_ID": "omexcourier",
   "PASSWORD": "Rta7vvMd",
   "BRAND_NAME": "OmexCourier"
  },
  "production":{
    "USER_ID": "omexcourier",
    "PASSWORD": "Rta7vvMd",
    "BRAND_NAME": "OmexCourier"
  },
  'development':{
    "USER_ID": "omexcourier",
    "PASSWORD": "Rta7vvMd",
    "BRAND_NAME": "OmexCourier"
  }
};

var BACKEND_NAME = "sslwireless";

var BASE_PROTOCOL = "http";
var AUTHENTICATION_EXTENSION = "";
var BASE_HOST = "sms.sslwireless.com";
var MESSAGE_EXTENSION = "/pushapi/dynamic/server.php";
var MAX_ATTEMPTS = 7;
var RETRY_DELAY = 2*60*1000; // 2 minutes delay for retrying

var getGatewayUrl = function(config_env){
  return BASE_PROTOCOL + "://" + AUTHENTICATION_EXTENSION  + BASE_HOST  + MESSAGE_EXTENSION;
};

var getHostName = function(){
  return BASE_HOST;
};

var getProtocol = function(){
  return BASE_PROTOCOL;
};

var prepareRequest = function(config_env , data){

  var URL = getGatewayUrl(config_env);
  var formattedData = {
    url: urlUtils.parse(URL),
    method: "POST",
    form:{
      "user": config_env.USER_ID,
      "pass": config_env.PASSWORD,
      "sid": config_env.BRAND_NAME,
      "sms[0][0]": data.toPhoneNum,
      "sms[0][1]": data.body
    },
    maxAttempts: MAX_ATTEMPTS,
    retryDelay: RETRY_DELAY
  };

  return formattedData;
};

module.exports.config = config;
module.exports.BACKEND_NAME = BACKEND_NAME;
module.exports.getGatewayUrl = getGatewayUrl;
module.exports.prepareRequest = prepareRequest;
module.exports.getProtocol = getProtocol;
