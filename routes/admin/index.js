var express = require('express');
var router = express.Router();
var config = require('./../../config');
var adminLogic = require('./../../logics/admin/adminLogic');
var upload = require('multer')();

var passport = require('passport');
var middleware = require(process.cwd() + '/middleware');
router.use(passport.authenticate('basic', {session: false}));
router.use(middleware.checkPermission);


router.get('/', function(req, res){
	res.send("In Admin page");
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
	else if(!adminData.region) return res.send({"err": JSON.stringify({"message": "Must set region"})});
	else if(!adminData.regionalBranch) return res.send({"err": JSON.stringify({"message": "Must set regional branch"})});

	adminLogic.createAdmin(adminData, function(err, admin){
		if(err){
			console.log(err);
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
	
	console.log("Change or delete admin");
	console.log(req.body);

});



module.exports = router;