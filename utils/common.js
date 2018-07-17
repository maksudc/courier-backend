function getErrorMessage(err){
  message = "";
  if(err && err.message){
    message = err.message;
  }
  return message;
}
exports.getErrorMessage = getErrorMessage;

module.exports.isNull = function($val){
  if(!$val){
    return true;
  }else if($val == "null"){
    return true;
  }else{
    return false;
  }
};
