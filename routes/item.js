var express = require("express");
var router = express.Router();
var Sequelize = require("sequelize");
var itemModel = require("../models/itemModel");
var multer = require("multer");
var upload = multer();

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

module.exports = router;