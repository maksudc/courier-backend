var express = require("express");
var router = express.Router();
var Sequelize = require("sequelize");
var itemModel = require("../models/itemModel");
var multer = require("multer");
var upload = multer();
var pricingLogic = require("../logics/pricingLogic");

router.get('/:id', function(req, res){
	if(!req.params.id){
		res.send({
			"status": "error",
			"data": {
				"message": "id required"
			}
		});
		return;
	}

	itemModel.findOne({where: {uuid: req.params.id}}).catch(function(err){

		if(err){
			res.send({
				"status": "error",
				"data": {
					"message": "Cannot get this item, an error occurred"
				}
			});
		}

	}).then(function(item){
		if(item){
			res.send({
				"status": "success",
				"data": item
			});
		}
		else{
			res.send({
				"status": "success",
				"data": null
			});
		}
	});
});

router.post('/create', upload.array(), function(req, res){
	if(!req.body.amount || !req.body.product_id){
		res.send({
			"status": "error",
			"data": {
				"message": "Not enough information given"
			}
		});
		return;
	}

	var data = {
		"amount": parseFloat(req.body.amount),
		"productUuid": req.body.product_id
	};

	pricingLogic.calculatePrice(data.productUuid, data.amount, function(price){

		if(!price){
			res.send({"status": "error", "data": {"message": "Cannot calculate price"}});
			return;
		}

		data["price"] = parseFloat(price);

		itemModel.create(data).catch(function(err){
			if(err){
				console.log(err);
				res.send({
					"status": "error",
					"data": {
						"message": "Cannot create this item, an error occurred"
					}
				});
			}

		}).then(function(item){
			if(item){
				res.send({
					"status": "success",
					"data": item
				});
			}
			else{
				res.send({
					"status": "error",
					"data":{
						"message": "Sorry, cannot create item"
					} 
				});
			}
		});

	});

});

router.post('/update', upload.array(), function(req, res){
	if(!req.body.id){
		res.send({
			"status": "error",
			"data": {
				"message": "Required id parameter missing"
			}
		});
		return;
	}
	else if(!req.body.product_id && !req.body.amount){
		res.send({
			"status": "error",
			"data": {
				"message": "Required product_id or amount"
			}
		});
		return;	
	}

	itemModel.findOne({where: {uuid: req.body.id}, attributes: ['uuid', 'amount', 'productUuid']}).catch(function(err){

		if(err){
			res.send({
				"status": "error",
				"data": {
					"message": "Cannot get this item, an error occurred"
				}
			});
			return;
		}

	}).then(function(item){
		if(item){
			
			if(req.body.amount) item.amount = parseFloat(req.body.amount);
			if(req.body.product_id) item.product_id = req.body.product_id;

			pricingLogic.calculatePrice(item.productUuid, item.amount, function(price){

				item.price = parseFloat(price);
				item.save().catch(function(err){
					
					if(err){
						res.send({
							"status": "error",
							"data": {
								"message": "Cannot get this item, an error occurred"
							}
						});
						return;
					}

				}).then(function(item){
					
					res.send({
						"status": "success",
						"data": item
					});
					return;

				});

			});
		}
		else{
			res.send({
				"status": "error",
				"data": {
					"message": "Cannot find the designated itemModel"
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
				"message": "id required"
			}
		});
		return;

	}

	itemModel.findOne({where: {uuid: req.body.id}, attributes: ['uuid']}).catch(function(err){
		if(err){
			res.send({
				"status": "error",
				"data": {
					"message": "Error while deleting this entry"
				}
			});
			console.log(err);

			return;
		}
	}).then(function(item){
		if(item){
			item.destroy();
			res.send({
				"status": "success",
				"data": {
					"message": "item deleted"
				}
			});
		}
		else{
			res.send({
				"status": "error",
				"data": {
					"message": "Cannot find this item"
				}
			});
		}
	});
});

module.exports = router;