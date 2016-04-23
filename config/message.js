var twilioConfig = require("./twilio");
var env = null;
if(!process.env.NODE_ENV){
  env = "development";
}else{
  env = process.env.NODE_ENV;
}

module.exports = {
  "From": twilioConfig[env].PHONE_NUM
};

module.exports.twilio = twilioConfig[env];
