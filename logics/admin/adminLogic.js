var DB = require("../../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var adminModel = sequelize.models.admin;
var async = require('async');


var checkLogin = function(email, password, next){
    adminModel.find({
        where: {email: email, password: password}}
    ).catch(function(err){
        if(err){
            next("Error while reading admin");
        }
    }).then(function(admin){
        if(admin){
            next(null, admin);
        }
        else{
            next("email or password missmtched!");
        }
    });
}

exports.checkLogin = checkLogin;

var findAdmin = function(email, next){

    adminModel.find({
        where: {email: email}}
    ).catch(function(err){
        if(err){
            next("Error while reading admin");
        }
    }).then(function(admin){
        if(admin){
            next(null, admin);
        }
        else{
            next("No admin found", false);
        }
    });

};

exports.findAdmin = findAdmin;


var createAdmin = function(data, next){

    console.log("In create admin");
    console.log(data.email);
    async.series([function(emailCheck){
        findAdmin(data.email, function(err, admin){
            
            if((!err || err == "No admin found") && !admin){
                console.log("No admin by this email found. Proceeding to create admin section");
                emailCheck(null);
            }
            else {
                console.log(err);
                console.log("error occurred in admin");
                emailCheck("This email is taken already!");
            }
        });

    }, function(createThisAdmin){

        adminModel.create({
            email: data.email,
            full_name: data.firstName + " " + data.lastName,
            username: data.username,
            password: data.password,
            address: data.address,
            mobile: data.phoneNO,
            national_id: data.nationalID,
            role: data.role
        }).catch(function(err){

            console.log(err);
            createThisAdmin(err.errors[0]["message"]);

        }).then(function(admin){
            if(admin){
                next(null, admin);
                createThisAdmin(null);
            }
        });

    }], 
    function(err){
        return next(err);
    });

};

exports.createAdmin = createAdmin;