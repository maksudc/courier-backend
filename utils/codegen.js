
var format = function(maxNumOfDigits , num){

  if(!num ){
      throw "Can not process an undefined or null item. Must be an integer";
  }
  if(!maxNumOfDigits ){
      throw "maxNumOfDigits must be specified an integer";
  }

  numS = num + "";

  missingDigitCount = 0;
  if(numS.length < maxNumOfDigits){
    missingDigitCount = maxNumOfDigits - numS.length;
  }else{
    throw "Given number's digit length must be smaller than maxNumOfDigits";
  }

  for(I =0 ; I < missingDigitCount ; I++){
    numS = "0" + numS;
  }

  return numS;
};

exports.format = format;
