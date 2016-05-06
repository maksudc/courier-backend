var express = require("express");
var router = express.Router();
var reportLogic = require("../logics/reportLogic");
var branchLogic = require('../logics/branchLogic');
var upload = require('multer')();
var async = require('async');

var passport = require('passport');
var middleware = require(process.cwd() + '/middleware');
router.use(passport.authenticate('basic', {session: false}));
router.use(middleware.checkPermission);


router.get("/" , function(req, res){
	
	console.log("In report router");
	reportLogic.getReport(function(err, reportData){
		if(err) res.send({"status": "error", error: err});
		else res.send({"status": "success", data: reportData});
	});
});

router.get("/parcel/cashin", function(req, res){

	reportLogic.getOrderPaymentData(req.query, req.user, function(err, reportData){
		if(err) res.send({"status": "error", error: err});
		else res.send({"status": "success", data: reportData});
	});

});


router.get("/money/cashin", function(req, res){

	reportLogic.findMoneyCashIn(req.query, req.user, function(err, reportData){
		if(err) res.send({"status": "error", error: err});
		else res.send({"status": "success", data: reportData});
	});

});


router.get("/money/cashout", function(req, res){

	reportLogic.findMoneyCashOut(req.query, req.user, function(err, reportData){
		if(err) res.send({"status": "error", error: err});
		else res.send({"status": "success", data: reportData});
	});

});



module.exports = router