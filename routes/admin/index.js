var express = require('express');
var router = express.Router();
var config = require('./../../config');
var adminLogic = require('./../../logics/admin/adminLogic');

/* Order route definitions */
// router.use('/login', require('./login'));


router.get('/', function(req, res){
	res.send("In Admin page");
});

router.get('/types', function(req, res){
	res.send({data: JSON.stringify(config.adminTypes)});
});

router.post('/create', function(req, res){
	
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
			res.send({"err": {"message": JSON.stringify(err)}});
		}
		else if(admin){
			res.send({"data": JSON.stringify(admin)});
		}
	});
});


module.exports = router;