var express = require("express");
var router = express.Router();
var Sequelize = require("sequelize");
var itemModel = require("../models/itemModel");
var multer = require("multer");
var upload = multer();
var productLogic = require("../logics/productLogic");
var itemLogic = require("../logics/itemLogic");

router.get('/:id', function(req, res){

	itemLogic.findOneById(req.params.id, function(data){
		if(data){
			res.send(data);
		}
		else res.send({"status": "error", "message": "Cannot find item", "data": null});
	});

});

router.post('/create', upload.array(), function(req, res){
	
	if(!req.body){
		res.send({"status": "error", "message": "No information", "data": null});
		return;
	}

	itemLogic.createOne(req.body, function(data){
		if(data){
			res.send(data);
		}
		else res.send({"status": "error", "message": "Cannot create item", "data": null});
	});

});

router.post('/update', upload.array(), function(req, res){
	
	if(!req.body){
		res.send({"status": "error", "message": "No information", "data": null});
		return;
	}

	itemLogic.updateOne(req.body, function(data){
		if(data){
			res.send(data);
		}
		else res.send({"status": "error", "message": "Cannot create item"});
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