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


	var draftOrder = {
		sender: postData.sender,
		receiver: postData.receiver
	};

	if(postData.sender_addr) draftOrder["sender_addr"] = postData.sender_addr;
	if(postData.receiver_addr) draftOrder["receiver_addr"] = postData.receiver_addr;

	orderModel.create(draftOrder).catch(function(err){
		if(err){
			console.log(err);
			next({"status": "error","message": "Error occured while creating order"});
			return;		
		}
	}).then(function(order){
		if(order){
			//Now create items under that order
			_.forEach(postData.item_list, function(item){
				item["orderUuid"] = order.uuid;
			});

			itemLogic.create(postData.item_list, function(data){
				if(data.status == 'success'){
					order["items"] = data.data;
					next({"status": "success", data: order});
				}
				else{
					order.destroy();
					next(data);
				}
				return;
			});
		}
		else{
			next({"status": "error", "message": "No order created!!!"});
			return;		
		}
	});

};

exports.createDraft = createDraft;




