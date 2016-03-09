var express = require("express");
var router = express.Router();
var Sequelize = require("sequelize");
var productModel = require("../models/productModel");
var multer = require("multer");
var upload = multer();
var productLogic = require("../logics/productLogic");

router.post('/create', upload.array(),  function(req, res){

	productLogic.createOne(req.body, function(data){
		if(data){
			res.send(data);
		}
		else res.send({"status": "error", "message": "Cannot create product", "data": null});
	});

});

router.post('/update',upload.array(), function(req, res){

	productLogic.updateOne(req.body, function(data){
		if(data){
			res.send(data);
		}
		else res.send({"status": "error", "message": "Cannot update product", "data": null});
	});

});

router.post('/delete', upload.array(), function(req, res){
	if(!req.body.id){
		res.send({
			"status": "error",
			"data": {
				"message": "No id defined"
			}
		});
		return;
	}

	productModel.findOne({where: {uuid: req.body.id}}).catch(function(err){
		if(err){
			res.send({
				"status": "error",
				"data": {
					"message": "Error while deleting this entry"
				}
			});

			return;
		}
	}).then(function(product){
		if(product){
			product.destroy();
			res.send({
				"status": "success",
				"data": {
					"message": "Product deleted"
				}
			});
		}
		else{
			res.send({
				"status": "error",
				"data": {
					"message": "Cannot find this product"
				}
			});
		}
	});
});

router.get('/:id', function(req, res){
	if(!req.params.id){
		res.send({"status": "error", "data": {"message": "Id required"}});
		return;
	}

	pricingLogic.findOneById(req.params.id, function(data){
		if(data.data){
			res.send({
				"status": "success",
				"data": data.data
			});
		}
		else{
			res.send({
				"status": "error",
				"data": {
					"message": "Product not found!"
				}
			});
		}
	});

});

module.exports = router;