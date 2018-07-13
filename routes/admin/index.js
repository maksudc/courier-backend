var express = require('express');
var router = express.Router();
var config = require('./../../config');
var adminLogic = require('./../../logics/admin/adminLogic');
var branchLogic = require('./../../logics/branchLogic');
var upload = require('multer')();
var async = require('async');

var passport = require('passport');
var middleware = require(process.cwd() + '/middleware');
var HttpStatusCodes = require("http-status-codes");

router.use(passport.authenticate('basic', {session: false}));
router.use(middleware.checkPermission);

router.get('/', function(req, res){
	res.send("In Admin page");
});

router.get('/view', function(req, res){

	var viewData;

	adminLogic.findAdmin(req.user.email, function(err, adminData){

		if(err) res.send({"status":"error", data: err});
		else if(!adminData) res.send({"status": "error", data: null, message: "No admin found!"});
		else {

			viewData = {
				email: adminData.dataValues.email,
				username: adminData.dataValues.username,
				birth_date: adminData.dataValues.birth_date,
				full_name: adminData.dataValues.full_name,
				address: adminData.dataValues.address,
				national_id: adminData.dataValues.address,
				role: adminData.dataValues.role,
				mobile: adminData.dataValues.mobile
			}

			async.series([function(findSubBranch){
				if(adminData.dataValues.sub_branch_id){
					branchLogic.getBranch('sub', adminData.dataValues.sub_branch_id, function(subBranchData){
						if(subBranchData.status == 'success'){
							viewData["sub_branch"] = {
								"id": subBranchData.data.dataValues.id,
								"label": subBranchData.data.dataValues.label
							}
						}

						findSubBranch(null);
					});
				}
				else findSubBranch(null);
			}, function(findRerionalBranch){

				if(adminData.dataValues.regional_branch_id){
					branchLogic.getBranch('regional', adminData.dataValues.regional_branch_id, function(regionalBranchData){
						if(regionalBranchData.status == 'success'){
							viewData["regional_branch"] = {
								"id": regionalBranchData.data.dataValues.id,
								"label": regionalBranchData.data.dataValues.label
							}
						}
						else res.send({"status": "error", message:"No regional branch found!"});

						res.send({"status": "success", data: viewData});
					});
				}
				else findSubBranch(null);

			}], function(err){
				if(err){
					console.error(err.stack);
					res.send({"status": "error", data: err});
				}
			});
		}
	});
});

router.get('/types', function(req, res){
	res.send({data: JSON.stringify(config.adminTypes)});
});


router.post('/create', function(req, res){

	console.log("Hitting here!!!");

	var adminData = req.body;
	console.log(adminData);
	if(!adminData.email) return res.send({"err": JSON.stringify({"message": "Must have email"})});
	else if(!adminData.password) return res.send({"err": JSON.stringify({"message": "Must set password"})});
	else if(!adminData.username) return res.send({"err": JSON.stringify({"message": "Must have user name"})});
	else if(!adminData.role) return res.send({"err": JSON.stringify({"message": "Must select role"})});
	else if(!adminData.phoneNO) return res.send({"err": JSON.stringify({"message": "Must select phone number"})});
	else if(!adminData.regionalBranch) return res.send({"err": JSON.stringify({"message": "Must set regional branch"})});

	adminLogic.createAdmin(adminData, function(err, admin){
		if(err){
			console.error(err.stack);
			res.send({"err": {"message": JSON.stringify(err)}});
		}
		else if(admin){
			console.log("Admin created");
			res.send({"data": JSON.stringify(admin)});
		}
	});
});


router.post('/updateSelf', function(req, res){

	adminLogic.updateSelf(req.body, function(err, admin){
		if(err) res.send({"status": "error"});
		else res.send({"status": "success"});
	});

});


router.get('/update', function(req, res){
	/*
	Get all admin email and the admin types for Selecting admin in client side
	*/

	if(req.user.role != config.adminTypes.super_admin.type) return res.send(401);
	console.log(req.user);

	adminLogic.getAdminsToChange(function(err, adminList){
		if(err) return res.send({"status": "error", error: err});
		else return res.send({
			"status": "success",
			data: {
				adminList: adminList,
				adminTypes: JSON.stringify(config.adminTypes)
			}
		});
	});

});


router.get('/update/:email', function(req, res){
	/*
	Get all admin email and the admin types for Selecting admin in client side
	*/

	if(req.user.role != config.adminTypes.super_admin.type) return res.send(401);
	console.log(req.user);

	adminLogic.getAdminToChage(req.params.email, function(err, admin){
		if(err) return res.send({"status": "error", error: err});
		else return res.send({"status": "success", data: admin});
	});

});


router.post('/update', upload.array(), function(req, res){

	adminLogic.updateAdmin(req.body, function(err, admin){
		if(err) return res.send({"status": "error", error: err});
		else return res.send({"status": "success", data: admin});
	});

});

router.post('/delete', upload.array(), function(req, res){

	if(req.user.role != config.adminTypes.super_admin.type){
		return res.send(401);
	}

	adminLogic.deleteAdmin(req.body.email, function(err, admin){
		if(err || !admin) res.send({"status": "error", message: err});
		else res.send({"status":"success", data: admin});
	});

});

module.exports = router;
