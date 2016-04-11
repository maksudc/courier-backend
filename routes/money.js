var express = require("express");
var router = express.Router();
var clientLogic = require("../logics/clientLogic");
var moneyLogic = require("../logics/moneyLogic");
var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');

//Authentication support
var passport = require('passport');
var middleware = require(process.cwd() + '/middleware');
router.use(passport.authenticate('basic', {session: false}));
router.use(middleware.checkPermission);


router.post('/create', upload.array(), function(req, res){
	moneyLogic.create(req.user, req.body, function(err, data){
		if(err || !data){
			res.send({"status": "error", "error": err});
		}
		else {
			res.send({"status": "success", "data": data});
		}
	});
});

router.get('/viewAll', function(req, res){

	moneyLogic.findAll(function(err, data){
		if(err) res.send({"status": "error", error: error});
		else if(!data) res.send({"status": "error", data: []});
		else res.send({"status": "success", data: data});
	});
	
});

router.get('/view/:id', function(req, res){

	var id = req.params.id;
	
	moneyLogic.findById(id, function(err, data){
		if(err) res.send({"status": "error", error: error});
		else if(!data) res.send({"status": "error", data: []});
		else res.send({"status": "success", data: data});
	});

});

router.post('/receive', upload.array(), function(req, res){
	
	moneyLogic.receiveOrder(req.body.money_order_id, req.body.verification_code, function(err, data){
		if(err || !data) res.send({"status": "error", message: err || "Cannot receive this order"});
		else res.send({"status": "success", data: data});
	});

});

router.post('/confirm', upload.array(), function(req, res){
	
	moneyLogic.confirmOrder(req.body.money_order_id, function(err, data){
		if(err || !data) res.send({"status": "error", message: err || "Cannot receive this order"});
		else res.send({"status": "success", data: data});
	});

});

router.post('/deliver', upload.array(), function(req, res){
	
	moneyLogic.deliverOrder(req.body.money_order_id, req.body.verification_code, function(err, data){
		if(err || !data) res.send({"status": "error", message: err || "Cannot receive this order"});
		else res.send({"status": "success", data: data});
	});

});


module.exports = router;