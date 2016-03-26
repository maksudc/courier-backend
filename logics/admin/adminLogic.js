var DB = require("../../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var adminModel = sequelize.models.admin;


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
            next("No admin found");
        }
    });

};

exports.findAdmin = findAdmin;