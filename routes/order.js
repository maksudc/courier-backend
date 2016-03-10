var express = require("express");
var router = express.Router();
var orderLogic = require("../logics/orderLogic");
var multer = require("multer");
var upload = multer();

router.get('/:id', function(req, res){
	if(!req.params.id){
		res.send({
			"status": "error",
			"data": {
				"message": "Id required"
			}
		});
		return;
	}

	order.findOne(req.body.id, function(data){
		//TO DO: find order by id
		res.send({"status": "In order page"});
	});
});

router.post('/createDraft', upload.array(), function(req, res){
	/*
	when client creates an order. requried and accessible parameters are:
	sender, sender_addr, receiver, receiver_addr and list of items
	*/
	orderLogic.createDraft(req.body, function(data){
		res.send(data);
	});
});


router.post('/updateDraft', upload.array(), function(req, res){
	/*
	when client creates an order. requried and accessible parameters are:
	sender, sender_addr, receiver, receiver_addr and list of items
	*/
	orderLogic.updateDraft(req.body, function(data){
		res.send(data);
	});
});

router.post('/deleteDraft', upload.array(), function(req, res){
	/*
	when client creates an order. requried and accessible parameters are:
	sender, sender_addr, receiver, receiver_addr and list of items
	*/
	orderLogic.deleteDraft(req.body, function(data){
		res.send(data);
	});
});

module.exports = router;


