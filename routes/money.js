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
var HttpStatus = require("http-status-codes");

router.use(passport.authenticate('basic', {session: false}));
router.use(middleware.checkPermission);

// Panic mode detection and header addition
var panicMiddleware = require("./../middleware/panic");
router.use(panicMiddleware.addPanicSettingsHeaderIfApplicable);

router.post('/create', upload.array(), function(req, res){
	moneyLogic.create(req.user, req.body, function(err, data){
		if(err){
			console.error(err.stack);
		}
		if(err || !data){
			res.send({"status": "error", "error": err});
		}
		else {
			res.send({"status": "success", "data": data});
		}
	});
});

router.get('/viewAll', function(req, res){

	moneyLogic.findAll(req.user, function(err, data){
		if(err){
			console.error(err.stack);
		}
		if(err) res.send({"status": "error", error: err});
		else if(!data) res.send({"status": "error", data: []});
		else res.send({"status": "success", data: data});
	});

});

router.get('/view/:id', function(req, res){

	var id = req.params.id;

	moneyLogic.findById(id, function(err, data){
		if(err){
			console.error(err.stack);
		}
		if(err) res.send({"status": "error", error: err});
		else if(!data) res.send({"status": "error", data: []});
		else res.send({"status": "success", data: data});
	});

});

router.post('/receive', upload.array(), function(req, res){

	moneyLogic.receiveOrder(req.body.money_order_id, req.body.verification_code, req.user, function(err, data){
		if(err){
			console.error(err.stack);
		}
		if(err || !data) res.send({"status": "error", message: err || "Cannot receive this order"});
		else res.send({"status": "success", data: data});
	});

});

router.post('/confirm', upload.array(), function(req, res){

	moneyLogic.confirmOrder(req.body.money_order_id, req.user, function(err, data){
		if(err){
			console.error(err.stack);
		}
		if(err || !data) res.send({"status": "error", message: err || "Cannot receive this order"});
		else res.send({"status": "success", data: data});
	});

});

router.post('/deliver', upload.array(), function(req, res){

	moneyLogic.deliverOrder(req.body.money_order_id, req.body.verification_code, req.user, function(err, data){
		if(err){
			console.error(err.stack);
		}
		if(err || !data) res.send({"status": "error", message: err || "Cannot receive this order"});
		else res.send({"status": "success", data: data});
	});

});


router.post('/delete', upload.array(), function(req, res){
	moneyLogic.deleteMoneyOrder(req.user, req.body.money_order_id, function(err, data){
		if(err || !data){
			res.send({"status": "error", "error": err});
		}
		else {
			res.send({"status": "success", "data": data});
		}
	});
});

router.delete('/:id' , function(req , res){

	moneyLogic.destroy(req.params.id , function(data){
		if(data.statusCode){
			res.status(data.statusCode);
		}
		res.send(data);
	});
});

router.post('/updateVDPrice', upload.array(), function(req, res){

	moneyLogic.updateVDPrice(req.body, function(err, data){
		if(err){
			console.error(err.stack);
		}
		if(err || !data){
			res.send({"status": "error", "error": err});
		}
		else {
			res.send({"status": "success", "data": data});
		}
	});
});


module.exports = router;
