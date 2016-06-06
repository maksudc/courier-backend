var express = require("express");
var router = express.Router();
var orderLogic = require("../logics/orderLogic");
var multer = require("multer");
var upload = multer();
var passport = require('passport');
var bodyParser = require('body-parser');

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// var middleware = require(process.cwd() + '/middleware');
// router.use(passport.authenticate('basic', {session: false}));
// router.use(middleware.checkPermission);

router.get('/getOrderView/:id', function(req, res){
	if(!req.params.id){
		res.send({
			"status": "error",
			"data": {
				"message": "Id required"
			}
		});
		return;
	}

	//New function, will be used to seperate multiple items
	/*orderLogic.orderDetailView(req.params.id, function(data){
		res.send(data);
	});*/

	orderLogic.orderDetail(req.params.id, function(data){
		if(data.statusCode){
			res.status(data.statusCode);
		}
		res.send(data);
	});
});


router.get('/getOrder/:id', function(req, res){
	if(!req.params.id){
		res.send({
			"status": "error",
			"data": {
				"message": "Id required"
			}
		});
		return;
	}

	orderLogic.orderDetail(req.params.id, function(data){
		res.send(data);
	});
});


router.get('/showAll', function(req, res){

	console.log("Calling all received orders");
	console.log(req.query);

	orderLogic.findAllOrders(req.query, function(data){
		res.send(data);
	});
});

router.get('/showAll/:id', function(req, res){

	if(!req.params.id) res.send({status: "error", message: "Mobile number required"});
	else {
		var mobile = req.params.id;
		orderLogic.findAllOrdersByMobile({sender: mobile}, function(data){
			res.send(data);
		});
	}
});

router.get('/showByStatus/:status', function(req, res){

	if(!req.params.status) res.send({status: "error", message: "Status required"});
	else {
		var status = req.params.status;
		orderLogic.findAllOrdersByMobile({status: status}, function(data){
			res.send(data);
		});
	}
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

router.delete('/:orderUuid' , function(req , res){

	orderLogic.deleteOrder(req.params.orderUuid , function(data){
		if(data.statusCode){
			res.status(data.statusCode);
		}
		res.send(data);
	});
});

router.post('/createByOperator', passport.authenticate('basic', {session: false}), upload.array(), function(req, res){

		/*When operator creates an order.
		1st release.....
			{
				item_list: [
					product_name: ...
					price: ...
					unit: ...
				]
			}
		*/

		orderLogic.createByOperator(req.body, req.user, function(data){
			res.send(data);
	});
});


router.post('/updateStatus', upload.array(), function(req, res){

	orderLogic.updateStatus(req.body, function(err, order){
		if(err) res.send({"status": "error", error: err});
		else res.send({"status": "success", data: order});
	});

});


router.post('/deliverOrder', passport.authenticate('basic', {session: false}), upload.array(), function(req, res){
	orderLogic.deliverOrder(req.body.id, req.user, function(data){
		res.send(data);
	});
});


router.post('/receivePayment', passport.authenticate('basic', {session: false}), upload.array(), function(req, res){
	orderLogic.receivePayment(req.body, req.user, function(data){
		res.send(data);
	});
});


router.post('/orderDetail/:id', function(req, res){
	orderLogic.orderDetail(req.params.id, function(data){
		res.send(data);
	});
});


router.post('/confirmOrder', passport.authenticate('basic', {session: false}), upload.array(), function(req, res){
	console.log(req.body);

	orderLogic.confirmOrder(req.body.id, req.body.code, function(data){
		res.send(data);
	});
});

router.post('/receiveOrder', passport.authenticate('basic', {session: false}), upload.array(), function(req, res){

	orderLogic.receiveOrder(req.body.id, req.user, function(data){
		res.send(data);
	});

});

router.get('/getOrderByClient/:client', function(req, res){

	orderLogic.findOrderByClient(req.params.client, function(err, orderList){
		if(err) res.send({status: "error", message:"Error while getting order list by client"});
		else res.send({"status": "success", data: orderList});
	});

});


router.post('/addItem', function(req, res){

	orderLogic.addItem(req.body, req.user, function(err, order){
		if(err) res.send({status: "error", message:"Error while getting order list by client"});
		else res.send({"status": "success", data: order});
	});

});

router.get("/analytics" , function(req , res){

	orderLogic.getAnalytics(req.query , function(data){

		if(data.statusCode){
			res.status(data.statusCode);
		}
		res.send(data);
	});
});


module.exports = router;
