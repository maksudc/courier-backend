var sequelize = require("../models/connect");
var Sequelize = require("sequelize");
var orderModel = require("../models/orderModel");
var itemModel = require("../models/itemModel");
var itemLogic = require("../logics/itemLogic");
var _ = require("lodash");

var findOne = function(id, next){
	next("in findOne");
};
exports.findOne = findOne;



var createDraft = function(postData, next){
	/*
		required params: sender, receiver, payment(to be calculated here), status
		1. Check if all required parameters exists
		2. create data
		3. save to databse
	*/

	var message = "";

	if(!postData) message = "No information provied!";
	else if(!postData.sender) message = "Sender required";
	else if(!postData.receiver) message = "Receiver required";
	else if(!postData.item_list) message = "Items required";

	if(message != ""){
		next({"status": "error", "message": message});
		return;
	}

	itemLogic.create(postData.item_list, function(itemList){
		if(itemList.status == 'error'){
			next(data);
			return;
		}

		var draftOrder = {
			sender: postData.sender,
			receiver: postData.receiver
		};

		_.forEach(itemList.data, function(item){
			item["order_id"] = draftOrder["uuid"];
			item["uuid"] = Sequelize.UUIDV1;
		});

		if(postData.sender_addr) draftOrder["sender_addr"] = postData.sender_addr;
		if(postData.receiver_addr) draftOrder["receiver_addr"] = postData.receiver_addr;

		console.log(draftOrder);

		orderModel.create(draftOrder, {
  			include: [ items ]
		}).catch(function(err){
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
				console.log("fafdafadfafsdf");
				next({"status": "error", "message": "No order created!!!"});
				return;		
			}
		});
		
	});

};
exports.createDraft = createDraft;




