var passportLocal = require('passport-local');
var passportHTTP = require('passport-http');
var adminLogic = require('../admin/adminLogic');
var clientLogic = require('../clientLogic');
var permissionModel = require('../../models/permission');

exports.setup = function(passport){

    passport.use(new passportHTTP.BasicStrategy(function(email, password, done){

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
              done(null);
              //Here, user will be checked
           }
           else if(admin){
              done(null, {
                email: admin.dataValues.email,
                role: admin.dataValues.role,
                username: admin.dataValues.username,
                address: admin.dataValues.address,
                national_id: admin.dataValues.national_id,
                region_id: admin.dataValues.region_id,
                regional_branch_id: admin.dataValues.regional_branch_id,
                sub_branch_id: admin.dataValues.sub_branch_id,
                admin: true,
                type: "admin"
              });

              console.log("Admin: " + admin.dataValues.email);
           }
           else {
              done(null, false);
          }
       });
    }));

    passport.use("basic-client-login" , new passportHTTP.BasicStrategy(function(mobile , password , done){

        if(mobile.length == 0)
        {
            req.flash("error" , "You have to give a valid email address");
            return done(null , false);
        }

        if(password.length==0)
        {
            req.flash("error" , "Password cannot be blank");
            return done(null , false);
        }

        clientLogic.checkLogin(mobile, password, function(err, client){
            if(err) {
                done(err);
            }
            else if(client){
                var clientData = {
                    mobile: client.mobile,
                    address: client.address,
                    full_name: client.full_name,
                    status: client.status,
                    role: 'client',
                    type: "client",
                    createdAt: client.createdAt.toDateString()
                };
                console.log("Client: " + client.mobile);

                done(null, clientData);
            }
            else {
                done(null, false);
            }
        });

    }));
};
