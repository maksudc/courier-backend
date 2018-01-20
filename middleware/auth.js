var passport = require("passport");

exports.hasGenericAccess = function(req , res , next){

  if(req.headers["user-type"] == "client"){
    passport.authenticate("basic-client-login" , {session: false})(req, res , next);
  }else{
    passport.authenticate("basic" , {session: false})(req, res , next);
  }
};
