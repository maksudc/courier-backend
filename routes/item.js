var express = require("express");
var router = express.Router();
var Sequelize = require("sequelize");
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
		else res.send({"status": "error", "message": "Cannot update item"});
	});

});

router.post('/delete', upload.array(), function(req, res){

	if(!req.body){
		res.send({"status": "error", "message": "No information", "data": null});
		return;
	}

	itemLogic.deleteOne(req.body, function(data){
		if(data){
			res.send(data);
		}
		else res.send({"status": "error", "message": "Cannot delete item"});
	});

});

router.post('/addItems', upload.array(), function(req, res){

	if(!req.body){
		res.send({"status": "error", "message": "Not enought information given", "data": null});
		return;
	}

	itemLogic.addItems(req.body, function(data){
		if(data){
			res.send(data);
		}
		else res.send({"status": "error", "message": "Cannot delete item"});
	});

});

router.post('/receiveItem', upload.array(), function(req, res){
	if(!req.body.id){
		res.send({"status": "error", "message": "Not enought information given", "data": null});
		return;
	}

	itemLogic.changeStatus(req.body.id, function(err, item){
		if(err) res.send({"status": "error", data: err});
		else res.send({"status": "success", data: item});
	});
})

module.exports = router;
