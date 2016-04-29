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

var getGatewayUrl = function(config_env){

   BASE_PROTOCOL = "https";
   AUTHENTICATION_EXTENSION = "";
   BASE_HOST = "powersms.banglaphone.net.bd";
   MESSAGE_EXTENSION = "/httpapi/sendsms";

  return BASE_PROTOCOL + "://" + AUTHENTICATION_EXTENSION  + BASE_HOST  + MESSAGE_EXTENSION;

};


var prepareRequest = function(config_env , data){

  var URL = getGatewayUrl(config_env);
  var formattedData = {
    url: URL,
    method: "POST",
    form:{
      "userId": config_env.USER_ID,
      "password": config_env.PASSWORD,
      //"From": config_env.From,
      "smsText": data.body,
      "commaSeperatedReceiverNumbers": data.toPhoneNum
    }
  };

  return formattedData;
};

module.exports.config = config;
module.exports.BACKEND_NAME = "banglaPhone";
module.exports.getGatewayUrl = getGatewayUrl;
module.exports.prepareRequest = prepareRequest;
