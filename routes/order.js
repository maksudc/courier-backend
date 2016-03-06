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

router.post('/create', upload.array(), function(req, res){
	orderLogic.createDraft(req.body, function(data){
		res.send(data);
	});
});

module.exports = router;


