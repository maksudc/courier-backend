var _= require("lodash");
var urlUtils = require("url");

var config = {
  'test':{
   "ACCOUNT_SID": "ACcc61aa7ceec4e92b95ff6260c03c7900",
   "AUTH_TOKEN": "b58020b12c4ae82e55c8ef4bb9e7f718",
   "PHONE_NUM": "+15005550006",
   "From": "+15005550006"
  },
  "production":{
   "ACCOUNT_SID": "ACa764d3152df9a4b2648eda861658b252",
   "AUTH_TOKEN": "3f3c3e109d6c24032e979b2ebb68fb6c",
   "PHONE_NUM": "+1 662-845-4120",
   "From": "+15005550006"
 },
 'development':{
  "ACCOUNT_SID": "ACcc61aa7ceec4e92b95ff6260c03c7900",
  "AUTH_TOKEN": "b58020b12c4ae82e55c8ef4bb9e7f718",
  "PHONE_NUM": "+15005550006",
  "From": "+15005550006"
 }
};

var getGatewayUrl = function(config_env){

   BASE_PROTOCOL = "https";
   AUTHENTICATION_EXTENSION = config_env.ACCOUNT_SID + ":" + config_env.AUTH_TOKEN + "@";
   BASE_HOST = "api.twilio.com/2010-04-01";
   ACCOUNT_EXTENSION = "/Accounts/" + config_env.ACCOUNT_SID;
   MESSAGE_EXTENSION = "/Messages";

  return BASE_PROTOCOL + "://" + AUTHENTICATION_EXTENSION  + BASE_HOST + ACCOUNT_EXTENSION + MESSAGE_EXTENSION;

};


var prepareRequest = function(config_env , data){

  var URL = getGatewayUrl(config_env);
  var formattedData = {
    url: urlUtils.parse(URL),
    method: "POST",
    form:{

      "From": config_env.From,
      "To": data.toPhoneNum,
      "Body": data.body
    }
  };

  return formattedData;
};

module.exports.config = config;
module.exports.BACKEND_NAME = "twilio";
module.exports.getGatewayUrl = getGatewayUrl;
module.exports.prepareRequest = prepareRequest;
