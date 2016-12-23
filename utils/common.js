function getErrorMessage(err){
  message = "";
  if(err && err.message){
    message = err.message;
  }
  return message;
}

exports.getErrorMessage = getErrorMessage;
