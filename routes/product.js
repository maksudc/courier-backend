var express = require("express");
var router = express.Router();
var Sequelize = require("sequelize");
var productModel = require("../models/productModel");
var multer = require("multer");
var upload = multer();
var productLogic = require("../logics/productLogic");

router.post('/create', upload.array(),  function(req, res){

	if(!req.body){
		res.send({"status": "error", "message": "No information", "data": null});
		return;
	}

	productLogic.createOne(req.body, function(data){
		if(data){
			res.send(data);
		}
		else res.send({"status": "error", "message": "Cannot create product", "data": null});
	});

});

router.post('/update',upload.array(), function(req, res){

	if(!req.body){
		res.send({"status": "error", "message": "No information", "data": null});
		return;
	}

	productLogic.updateOne(req.body, function(data){
		if(data){
			res.send(data);
		}
		else res.send({"status": "error", "message": "Cannot update product", "data": null});
	});

});

router.post('/delete', upload.array(), function(req, res){

	if(!req.body){
		res.send({"status": "error", "message": "No information", "data": null});
		return;
	}
	
	productLogic.deleteOne(req.body, function(data){
		if(data){
			res.send(data);
		}
		else res.send({"status": "error", "message": "Cannot delete product", "data": null});
	});

});

router.get('/:id', function(req, res){
	if(!req.params.id){
		res.send({"status": "error", "data": {"message": "Id required"}});
		return;
	}

	productLogic.findOneById(req.params.id, function(data){
		if(data){
			res.send(data);
		}
		else res.send({"status": "error", "message": "Cannot getthis product", "data": null});
	});

});

module.exports = router;