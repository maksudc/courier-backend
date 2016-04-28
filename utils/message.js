var messageConfig = require("../config/message");
var request = require("request");
var HttpStatus = require("http-status-codes");
var phoneUtil = require("./phone");
//
// var getGatewayUrl = function(){
//
//    BASE_PROTOCOL = "https";
//    AUTHENTICATION_EXTENSION = messageConfig.twilio.ACCOUNT_SID + ":" + messageConfig.twilio.AUTH_TOKEN + "@";
//    BASE_HOST = "api.twilio.com/2010-04-01";
//    ACCOUNT_EXTENSION = "/Accounts/" + messageConfig.twilio.ACCOUNT_SID;
//    MESSAGE_EXTENSION = "/Messages";
//
//   return BASE_PROTOCOL + "://" + AUTHENTICATION_EXTENSION  + BASE_HOST + ACCOUNT_EXTENSION + MESSAGE_EXTENSION;
//
// };

var sendMessage = function(toPhoneNum , body , next ){

  // https://www.twilio.com/docs/api/rest/sending-messages

  var receiverPhoneNumber = phoneUtil.standardizeNumber(toPhoneNum);
  var URL = messageConfig.getGatewayUrl();
  var requestParams = messageConfig.prepareRequest({
                         toPhoneNum: receiverPhoneNumber,
                         body: body
                      });

  request(requestParams , function(error , response , body){
    // callback

    if(error){
      console.log(JSON.stringify(error));
      next({ status: "error" , mesage:  JSON.stringify(error) + " " + JSON.stringify(body) });
      return;
    }

    if( response.statusCode >= HttpStatus.OK  && response.statusCode <= HttpStatus.ACCEPTED ){
      next({ status:"success" , message: body });
    }else{
      next({ status: "error" , message: body , statusCode: response.statusCode });
    }

  });

};

exports.sendMessage = sendMessage;
//exports.getGatewayUrl = getGatewayUrl;
