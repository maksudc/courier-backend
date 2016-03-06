var express = require("express");
var router = express.Router();
var Sequelize = require("sequelize");
var productModel = require("../models/priceModel");
var multer = require("multer");
var upload = multer();
var pricingLogic = require("../logics/pricingLogic");

router.post('/create', upload.array(),  function(req, res){

	//TO DO: check if price, product name and unit exists
	if(!req.body.product_name || !req.body.price || !req.body.unit){
		res.send({
			"status": "error",
			"data": {
				"message": "Not enough information given"
			}
		});
		return;
	}

	var data = {
		"product_name": req.body.product_name,
		"price": parseFloat(req.body.price),
		"unit": req.body.unit
	};

	if(req.body.threshold_unit && req.body.threshold_price) {
		data["threshold_unit"] = req.body.threshold_unit;
		data["threshold_price"] = parseFloat(req.body.threshold_price);
	}

	productModel.create(data).catch(function(error){
		if(error){
			console.log(error);
			res.send({
				"status": "error",
				"data": "Error in creating new entry"
			});
		}
	}).then(function(product){
		if(product){
			res.send({
				"status": "success",
				"data": data
			});
		}
	});
});

router.post('/update',upload.array(), function(req, res){

	if(!req.body.id){
		res.send({
			"status": "error",
			"data": {
				"message": "No id given"
			}
		});
		return;
	}

	productModel.findOne({where: {uuid: req.body.id}}).catch(function(err){
		if(err){
			res.send({
				"status": "error",
				"data": {
					"message": "Cannot update this entry"
				}
			});
		}

	}).then(function(product){
		
		if(product){
			if(req.body.product_name) product.product_name = req.body.product_name;
			if(req.body.price) product.price = parseFloat(req.body.price);
			if(req.body.unit) product.unit = req.body.unit;
			if(req.body.threshold_unit) product.threshold_unit = req.body.threshold_unit;
			if(req.body.threshold_price) product.threshold_price = parseFloat(req.body.threshold_price);

			product.save().catch(function(err){
				if(err){
					res.send({
						"status": "error",
						"data": {
							"message": "Error while updating"
						}
					});
				}
			}).then(function(new_product){
				if(new_product){
					res.send({
						"status": "success",
						"data": new_product
					});
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