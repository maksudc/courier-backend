var express = require("express");
var router = express.Router();
var clientLogic = require("../logics/clientLogic");
var multer = require("multer");
var upload = multer();
var passport = require('passport');
var bodyParser = require('body-parser');


router.get('/getAll', function(req, res){
	clientLogic.getAll(function(err, clientList){
		if(err) res.send({status: "error", message: err});
		else res.send({"status": "success", data: clientList});
	});
});

router.get('/get/:mobile', function(req, res){
	if(!req.params.mobile) res.send({"status":"error", "message": "Mobile number requried"});
	else{
		var mobile = req.params.mobile;
		clientLogic.findManyByMobile(mobile, function(err, clientList){
			if(err) res.send({status: "error", message: "Error while getting clients"});
			else if(!clientList) res.send({"status": "success", data: null, message: "No matching mobile no"});
			else res.send({"status": "success", data: clientList});
		});
	}
});

module.exports = router;