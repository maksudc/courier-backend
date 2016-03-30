var passportLocal = require('passport-local');
var passportHTTP = require('passport-http');
var adminLogic = require('../admin/adminLogic');
var permissionModel = require('../../models/permission');

exports.setup = function(passport){

    passport.serializeUser(function(user, done){
      
        //insert this user object to redis and then replace the user.email with redis id
        if(user.type == 'admin'){
            done(null, {email: user.email, type: 'admin'});
        }
        //for future use of user database
        else if(user.type == 'user') done(null, {mobile: user.mobile, type: 'admin'});
        else done(null, false);
    });

    passport.deserializeUser(function(user, done){

        if(user.type == 'admin') {
            adminLogic.findAdmin(user.email, function(err, admin){
                if(err) {
                    done(err, null);
                }
                else if(!admin) done("User name or password did not match");
                else {
        
                    done(null, {
                        email: admin.dataValues.email,
                        // username: admin.username,
                        // nationalId: admin.nationalId,
                        // mobile: admin.mobile,
                        role: admin.dataValues.role
                    });
                }
        
            });
        }
    });


    passport.use(new passportHTTP.BasicStrategy(function(email, password, done){
       //if the requested email is not a valid email address
       if(email.length == 0)
       {
           req.flash("error" , "You have to give a valid email address");
           return done(null , false);
       }

       if(password.length==0)
       {
           req.flash("error" , "Password cannot be blank");
           return done(null , false);
       }

       adminLogic.checkLogin(email, password, function(err, admin){
           if(err) {
               done(err);
           }
           else if(admin){
               done(null, {email: admin.email, type: 'admin'});
           }
           else done("Username and password did not match", false);
       });
    }));
}