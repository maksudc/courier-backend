var DB = require("../../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var adminModel = sequelize.models.admin;
var async = require('async');
var adminUtils = require("../../utils/admin");

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
            console.error(err.stack);
            next("Error while reading admin");
        }
    });
};

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
            console.log(err);
            next("Error while reading admin");
        }
    });

};

exports.findAdmin = findAdmin;


var getAdminToChage = function(email, next){

    adminModel.find({
        where: {email: email}}
    ).then(function(admin){
        if(admin){
            console.log(admin.dataValues);
            next(null, {
                full_name: admin.dataValues.full_name || '',
                regional_branch_id: admin.dataValues.regional_branch_id,
                sub_branch_id: admin.dataValues.sub_branch_id,
                region_id: admin.dataValues.region_id,
                mobile: admin.dataValues.mobile || '',
                national_id: admin.dataValues.national_id || '',
                address: admin.dataValues.address || '',
                username: admin.dataValues.username || '',
                role: admin.dataValues.role,
                state: admin.dataValues.state
            });
        }
        else{
            next("No admin found", false);
        }
    }).catch(function(err){
        if(err){
            console.error(err.stack);
            next("Error while reading admin");
        }
    });

};

exports.getAdminToChage = getAdminToChage;




var createAdmin = function(data, next){

    async.series([function(emailCheck){
        findAdmin(data.email, function(err, admin){

            if((!err || err == "No admin found") && !admin){
                console.log("No admin by this email found. Proceeding to create admin section");
                emailCheck(null);
            }
            else {
                console.error(err);
                console.error("error occurred in admin");
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
            regional_branch_id: parseInt(data.regionalBranch)
        };

        if(data.address) draftAdmin["address"] = data.address;
        if(data.username) draftAdmin["username"] = data.username;
        if(data.nationalID) draftAdmin["national_id"] = data.nationalID;
        if(data.subBranch && data.subBranch != '' && !isNaN(parseInt(data.subBranch))) draftAdmin["sub_branch_id"] = parseInt(data.subBranch);
        else draftAdmin["sub_branch_id"] = null;

        adminModel.create(draftAdmin).then(function(admin){
            if(admin){
                next(null, admin);
                createThisAdmin(null);
            }
        }).catch(function(err){
            if(err){
                console.error(err.stack);
            }
            createThisAdmin(err.errors[0]["message"]);

        });

    }],
    function(err){
        return next(err);
    });

};

exports.createAdmin = createAdmin;

var updateSelf = function(adminData, next){

    async.series([function(emailCheck){
        findAdmin(adminData.email, function(err, admin){

            if(err || !admin){
                // console.log("No admin by this email found. Proceeding to create admin section");
                emailCheck("Admin doesnot exists");
            }
            else {
                console.log(adminData);
                if(adminData.fullName && adminData.fullName != '')
                    admin.full_name = adminData.fullName;
                if(adminData.nationalID && adminData.nationalID != '')
                    admin.national_id = adminData.nationalID;
                if(adminData.username && adminData.username != '')
                    admin.username = adminData.username;
                if(adminData.phoneNO && adminData.phoneNO != '')
                    admin.mobile = adminData.phoneNO;
                if(adminData.address && adminData.address != '')
                    admin.address = adminData.address;
                if(adminData.password && adminData.password != '')
                    admin.password = adminData.password;
                if(adminData.regionalBranch && adminUtils.isPivilegedForProfileBranchUpdate(admin.role)){
                    admin.regional_branch_id = adminData.regionalBranch;
                }
                if(adminData.subBranch && adminUtils.isPivilegedForProfileBranchUpdate(admin.role)){
                    admin.sub_branch_id = adminData.subBranch;
                }else if(!adminData.subBranch && adminUtils.isPivilegedForProfileBranchUpdate(admin.role)){
                    admin.sub_branch_id = null;
                }
                admin.save().then(function(admin){
                    next(null, admin);
                    emailCheck(null);
                }).catch(function(err){
                    emailCheck("Error while saving");
                });


            }
        });

    }],
    function(err){

        if(err) next(err);

    });


};

exports.updateSelf = updateSelf;


var getAdminsToChange = function(next){

    adminModel.findAll({attributes: ['email', 'full_name']})
        .then(function(adminList){
            if(adminList){
                return next(null, adminList);
            }
            else return next(null, false);
        })
        .catch(function(err){
            if(err){
                console.error(err.stack);
            }
            return next(err);
        });
}

exports.getAdminsToChange = getAdminsToChange;

var getSameBranchAdmins = function(adminDataParams, next){

    adminModel.findAll({where: adminDataParams})
        .then(function(adminList){
            if(adminList){
                next(null, adminList);
            }
            else next(null, false);
        }).catch(function(err){
            if(err){
                console.error(err.stack);
                next(err);
            }
        });
}

exports.getSameBranchAdmins = getSameBranchAdmins;


var updateAdmin = function(updateData, next){

    adminModel.findOne({where: {email: updateData.email}})
        .then(function(admin){
            if(admin){

                //Condition to prevent admin to change himself. Even for super admin!

                if(updateData.full_name) admin.full_name = updateData.full_name;
                if(updateData.mobile) admin.mobile = updateData.mobile;
                if(updateData.username) admin.username = updateData.username;
                if(updateData.address) admin.address = updateData.address;
                if(updateData.state) admin.state = updateData.state;

                if(updateData.role) admin.role = updateData.role;

                if(updateData.regional_branch_id) admin.regional_branch_id = parseInt(updateData.regional_branch_id);
                if(updateData.sub_branch_id && parseInt(updateData.sub_branch_id) >= 0) admin.sub_branch_id = parseInt(updateData.sub_branch_id);
                else admin.sub_branch_id = null;


                admin.save();

                return next(null, {
                    full_name: admin.dataValues.full_name || '',
                    regional_branch_id: admin.dataValues.regional_branch_id,
                    sub_branch_id: admin.dataValues.sub_branch_id,
                    region_id: admin.dataValues.region_id,
                    mobile: admin.dataValues.mobile || '',
                    national_id: admin.dataValues.national_id || '',
                    address: admin.dataValues.address || '',
                    username: admin.dataValues.username || '',
                    role: admin.dataValues.role
                });
            }
            else return next(null, false);
        })
        .catch(function(err){
            if(err){
                console.error(err.stack);
                return next(err);
            }
        });

}

exports.updateAdmin = updateAdmin;


var deleteAdmin = function(email, next){

    adminModel.findOne({where: {email: email}})
    .then(function(adminData){
        if(adminData){
            adminData.destroy();
            next(null, true);
        }
        else next(null, false);
    }).catch(function(err){
        if(err){
            console.error(err.stack);
        }
        next(err);
    });

}

exports.deleteAdmin = deleteAdmin;
