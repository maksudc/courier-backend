var panicModeDef = require("./../config/siteSettings/panicModeDef");
var panicModeSettings = require("./../config/siteSettings/panicModeSettings");
var moment = require("moment-timezone");
var timezoneConfig = require("./../config/timezone");

module.exports.attachPanicQuery = function(query){

  var currentDateZoned = moment.tz(timezoneConfig.CLIENT_ZONE);
  var cappedStartDateZoned =  moment.tz(timezoneConfig.CLIENT_ZONE).subtract(panicModeSettings.DATA_DAY_VISIBLITY_WINDOW , "day");

  cappedStartDateZoned.set({
    "hour": 0,
    "minute": 0,
    "second": 0,
    "milisecond":0
  });

  var utcCurrentDate = currentDateZoned.tz(timezoneConfig.COMMON_ZONE);
  var utcCappedStartDateZoned = cappedStartDateZoned.tz(timezoneConfig.COMMON_ZONE);

  query["createdAt"] = {
    "$gte": utcCappedStartDateZoned.format("YYYY-MM-DD HH:mm:ss"),
    "$lte": utcCurrentDate.format("YYYY-MM-DD HH:mm:ss")
  };

  return query;
};

module.exports.isPanicked = function(req){
    return req.get(panicModeDef.slug) == "true";
};
