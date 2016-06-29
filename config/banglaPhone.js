var urlUtils = require('url');

var config = {
  'test':{
   "USER_ID": "omex",
   "PASSWORD": "Rta7vvMdZmDNRRHY",
   "PHONE_NUM": "+8803598182210",
   "From": "+8803598182210"
  },
  "production":{
    "USER_ID": "omex",
    "PASSWORD": "Rta7vvMdZmDNRRHY",
    "PHONE_NUM": "+8803598182210",
    "From": "+8803598182210"
  },
  'development':{
    "USER_ID": "omex",
    "PASSWORD": "Rta7vvMdZmDNRRHY",
    "PHONE_NUM": "+8803598182210",
    "From": "+8803598182210"
  }
};

var BASE_HOST = "powersms.banglaphone.net.bd";
var MAX_ATTEMPTS = 7;
var RETRY_DELAY = 2*60*1000; // 2 minutes delay for retrying

var getGatewayUrl = function(config_env){

   BASE_PROTOCOL = "https";
   AUTHENTICATION_EXTENSION = "";
   MESSAGE_EXTENSION = "/httpapi/sendsms";

  return BASE_PROTOCOL + "://" + AUTHENTICATION_EXTENSION  + BASE_HOST  + MESSAGE_EXTENSION;

};

var getHostName = function(){

  return BASE_HOST;
};

var prepareRequest = function(config_env , data){

  var URL = getGatewayUrl(config_env);
  var formattedData = {
    url: urlUtils.parse(URL),
    method: "POST",
    form:{
      "userId": config_env.USER_ID,
      "password": config_env.PASSWORD,
      //"From": config_env.From,
      "smsText": data.body,
      "commaSeperatedReceiverNumbers": data.toPhoneNum,
    },
    maxAttempts: MAX_ATTEMPTS,
    retryDelay: RETRY_DELAY
  };

  return formattedData;
};

module.exports.config = config;
module.exports.BACKEND_NAME = "banglaPhone";
module.exports.getGatewayUrl = getGatewayUrl;
module.exports.prepareRequest = prepareRequest;
