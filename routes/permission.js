var express = require("express");
var router = express.Router();
var permissionLogic = require("../logics/permissionLogic");
var multer = require("multer");
var upload = multer();
var passport = require('passport');
var bodyParser = require('body-parser');

router.get('/', function(req, res){
	res.send({"status": "success", "message": "In permission route"});
});

router.get('/view', function(req, res){
	permissionLogic.findByURL(req.query.url, function(err, data){
		if(err) res.send({"status":"error", message: err});
		else res.send({"status":"success", data: data});
	});
});

router.post('/create', upload.array(), function(req, res){

	permissionLogic.create(req.body, function(err, data){
		if(err) res.send({"status":"error", message: err});
		else res.send({"status":"success", data: data});
	});
});

router.post('/update', upload.array(), function(req, res){

	permissionLogic.update(req.body, function(err, data){
		if(err) res.send({"status":"error", message: err});
		else res.send({"status":"success", data: data});
	});
});

router.post('/delete', upload.array(), function(req, res){

	permissionLogic.deletedPermission(req.body, function(err, data){
		if(err) res.send({"status":"error", message: err});
		else res.send({"status":"success", data: data});
	});
});

module.exports = router;