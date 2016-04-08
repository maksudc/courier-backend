var DB = require("../../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var adminModel = sequelize.models.admin;
var async = require('async');


var checkLogin = function(email, password, next){
    adminModel.find({
        where: {email: email, password: password}}
    ).then(function(admin){
        if(admin){
            next(null, admin);
        }
        else{
            next("email or password missmtched!");
        }
    }).catch(function(err){
        if(err){
            console.log(err);
            next("Error while reading admin");
        }
    });
}

exports.checkLogin = checkLogin;

var findAdmin = function(email, next){

    adminModel.find({
        where: {email: email}}
    ).then(function(admin){
        if(admin){
            next(null, admin);
        }
        else{
            next("No admin found", false);
        }
    }).catch(function(err){
        if(err){
            next("Error while reading admin");
        }
    });

};

exports.findAdmin = findAdmin;


var createAdmin = function(data, next){

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

        var draftAdmin = {
            email: data.email,
            full_name: data.firstName + " " + data.lastName,
            password: data.password,
            mobile: data.phoneNO,
            role: data.role,
            region_id: parseInt(data.region),
            regional_branch_id: parseInt(data.regionalBranch)
        };

        if(data.address) draftAdmin["address"] = data.address;
        if(data.username) draftAdmin["username"] = data.username;
        if(data.nationalID) draftAdmin["national_id"] = data.nationalID;
        if(data.subBranch && data.subBranch != '' && !isNaN(parseInt(data.subBranch))) draftAdmin["sub_branch_id"] = parseInt(data.subBranch);

        adminModel.create(draftAdmin).then(function(admin){
            if(admin){
                next(null, admin);
                createThisAdmin(null);
            }
        }).catch(function(err){

            console.log(err);
            createThisAdmin(err.errors[0]["message"]);

        });

    }], 
    function(err){
        return next(err);
    });

};

exports.createAdmin = createAdmin;