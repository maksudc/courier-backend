var sequelize = require("../models/connect");
var orderModel = require("../models/orderModel");
var itemLogic = require("../logics/itemLogic");

var findOne = function(id, next){
	next("in findOne");
};
exports.findOne = findOne;



var createDraft = function(data, next){
	/*
		required params: sender, receiver, payment(to be calculated here), status
		1. Check if all required parameters exists
		2. create data
		3. save to databse
	*/
	itemLogic.create(data.item_list, function(data){
		if(data){
			next(data);
		}
		else next({"status": "error", "message": "Cannot crate list of items"});
	});

	return;

	var message = "";

	console.log(data);

	if(!data) message = "No information provied!";
	else if(!data.sender) message = "Sender required";
	else if(!data.receiver) message = "Receiver required";
	else if(!data.items) message = "Items required";

	if(message != ""){
		next({"status": "error", "message": message});
		return;
	}

	var draftOrder = {
		"sender": data.sender,
		"receiver": data.receiver,
		"itemUuid": data.items
	};

	orderModel.create(data).catch(function(err){
		if(err){
			console.log(err);
			next({"status": "error","message": "Error occured while creating order"});
			return;		
		}
	}).then(function(order){
		if(order){
			next({"status": "success","data": order});
			return;	
		}
		else{
			next({"status": "error", "message": "No order created!!!"});
			return;		
		}
	});

};
exports.createDraft = createDraft;




