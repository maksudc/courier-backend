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
	
});

router.get('/view/:id', function(req, res){
	
});

module.exports = router;