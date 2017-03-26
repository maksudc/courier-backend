var express = require("express");
var router = express.Router();

var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');
var HttpStatus = require("http-status-codes");
var moneyLogic = require("./../../../logics/moneyLogic");

router.get('/', function(req, res){

	moneyLogic.findBookings(req.query , function(err, data){
		if(err){
			console.error(err.stack);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR);
			res.send({"status": "error", error: err});
			return;
		}

		moneyLogic
		.getTotalMoneyCount(null)
		.then(function(c){

			recordsTotal = c;
			recordsFiltered = data.objects.count;

			res.status(HttpStatus.OK);
			res.send({
				"status": "success",
				data: data ,
				recordsTotal: recordsTotal ,
				recordsFiltered: recordsFiltered
			});
		})
		.catch(function(err){
			res.status(HttpStatus.INTERNAL_SERVER_ERROR);
			res.send({"status": "error", error: err});
		});
		// else if(!data) res.send({"status": "error", data: []});
	});

});


module.exports = router;
