var twilioConfig = require("./twilio");

module.exports = {
  "From": twilioConfig.PHONE_NUM
};
module.exports.twilio = twilioConfig;
