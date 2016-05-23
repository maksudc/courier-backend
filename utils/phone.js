var libphonenumber = require("google-libphonenumber");

var standardizeNumber = function(phoneNum){

  var phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
  var formattedPhoneNum = null;

  try{

    formattedPhoneNum = phoneUtil.parse(phoneNum , "BD");

  }catch(err){
    console.error(err);
  }

  if(formattedPhoneNum){
    return phoneUtil.format(formattedPhoneNum , libphonenumber.PhoneNumberFormat.E164);
  }
  return formattedPhoneNum;
};

exports.standardizeNumber = standardizeNumber;
