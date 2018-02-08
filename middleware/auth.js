var passport = require("passport");

exports.hasGenericAccess = function(req , res , next){

  if(req.headers["user-type"] == "client"){
    passport.authenticate("basic-client-login" , {session: false})(req, res , next);
  }else if(req.headers["user-type"] == "corporation"){
    passport.authenticate("basic-corporation-login" , {session: false})(req, res , next);
  }
  else{
    passport.authenticate("basic" , {session: false})(req, res , next);
  }
};
