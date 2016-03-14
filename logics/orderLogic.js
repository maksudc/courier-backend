var sequelize = require("../models/connect");
var Sequelize = require("sequelize");
var orderModel = require("../models/orderModel");
var itemLogic = require("../logics/itemLogic");
var productLogic = require("../logics/productLogic");
var _ = require("lodash");
var async = require("async");

var findOne = function(id, next){
	if(!id){
		next({"status":"error", "message": "Id required"});
		return;
	}

	orderModel.findOne({where: {uuid: id}}).catch(function(err){
		if(err){
			next({"status":"error", "message": "Error occurred while searching order"});
			return;
		}
	}).then(function(order){
		if(order){
			next({"status": "success", "data": order});
		}
		else{
			next({"status": "error", "message": "Cannot find any order by this id"});
		}
	});
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
		receiver: postData.receiver,
		entry_branch: postData["entry_branch"],
		exit_branch: postData["exit_branch"]
	};

	if(postData.sender_addr) draftOrder["sender_addr"] = postData.sender_addr;
	if(postData.receiver_addr) draftOrder["receiver_addr"] = postData.receiver_addr;
	if(postData.home_delivery) draftOrder["deliveryType"] = 'home';

	orderModel.create(draftOrder).catch(function(err){
		if(err){
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

var updateDraft = function(data, next){
	if(!data.id){
		next({"status": "error", "message": "Id required"});
		return;
	}


	findOne(data.id, function(orderData){
		if(orderData.status == 'success'){
			if(data.sender) orderData.data["sender"] = data.sender;
			if(data.sender_addr) orderData.data["sender_addr"] = data.sender_addr;
			if(data.receiver) orderData.data["receiver"] = data.receiver;
			if(data.receiver_addr) orderData.data["receiver_addr"] = data.receiver_addr;


			orderData.data.save();
			next({"status": "success", data: orderData.data});
		}
		else next(orderData);
	});


};

exports.updateDraft = updateDraft;

var deleteDraft = function(data, next){
	
	if(!data.id){
		next({"status": "error", "message": "Id required"});
		return;
	}

	findOne(data.id, function(orderData){
		if(orderData.status == 'success'){
			itemLogic.deleteByOrderId(data.id, function(deleteData){
				if(deleteData.status == 'success'){
					orderData.data.destroy();
					next({"status": "success", "id": data.id, "message": "Order deleted"});
				}
			});
		}
		else next(orderData);
	});

};

exports.deleteDraft = deleteDraft;


var confirmOrder = function(id, next){
	findOne(id, function(orderData){
		if(orderData.status == 'success'){
			orderData.data.status = 'confirmed';
			orderData.data.save().catch(function(err){
				if(err){
					next({"status": "error", "message": "Error while saving status"});
					return;
				}
			}).then(function(newOrderData){
				if(newOrderData){
					next({"status": "success", "data": newOrderData.dataValues});
				}
				else{
					next({"status": "error", "message": "Unknown error while saving status"});
				}

				return;
			});
		}
	});
}

exports.confirmOrder = confirmOrder;


var receiveOrder = function(id, next){
	findOne(id, function(orderData){
		if(orderData.status == 'success'){
			orderData.data.status = 'received';
			orderData.data.receiver_operator = 'fh74t85';
			orderData.data.receive_time = new Date();
			orderData.data.save().catch(function(err){
				if(err){
					next({"status": "error", "message": "Error while saving status"});
					return;
				}
			}).then(function(newOrderData){
				if(newOrderData){
					next({"status": "success", "data": newOrderData.dataValues});
				}
				else{
					next({"status": "error", "message": "Unknown error while saving status"});
				}

				return;
			});
		}
		else next(orderData);
	});
}

exports.receiveOrder = receiveOrder;



var deliverOrder = function(id, next){
	findOne(id, function(orderData){
		if(orderData.status == 'success'){

			if(orderData.data.payment_status == 'unpaid'){
				next({"status": "error", "message": "Sorry, please clear the payment first"});
				return;
			}

			orderData.data.status = 'delivered';
			orderData.data.delivery_operator = 'adfadfadfdasfdafasdfawfe';
			orderData.data.delivery_time = new Date();
			orderData.data.save().catch(function(err){
				if(err){
					next({"status": "error", "message": "Error while saving status"});
					return;
				}
			}).then(function(newOrderData){
				if(newOrderData){
					next({"status": "success", "data": newOrderData.dataValues});
				}
				else{
					next({"status": "error", "message": "Unknown error while saving status"});
				}

				return;
			});
		}
		else next(orderData);
	});
}

exports.deliverOrder = deliverOrder;



var createByOperator = function(postData, next){

	/*For first release:
	create draft --> createProducts --> add items --> receive this product(add operator id by login information)*/
	var createdProducts = {}, itemList, order, errorData;

	async.series([function(createDraft){

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
			receiver: postData.receiver,
			entry_branch: postData["entry_branch"],
			exit_branch: postData["exit_branch"]
		};

		if(postData.sender_addr) draftOrder["sender_addr"] = postData.sender_addr;
		if(postData.receiver_addr) draftOrder["receiver_addr"] = postData.receiver_addr;
		if(postData.home_delivery) draftOrder["deliveryType"] = 'home';

		orderModel.create(draftOrder).catch(function(err){
			if(err){
				errorData = err;
				createDraft("Cannot create draft order");
			}
		}).then(function(tempOrder){
			if(tempOrder && tempOrder.dataValues){
				order = tempOrder.dataValues;
				createDraft(null);
			}
			else {
				createDraft("Cannot create order");
			}
		});


	}, function(createProducts){

		_.forEach(postData.item_list, function(item){
			item["unitPrice"] = parseFloat(item["price"])/parseFloat(item["amount"]);
		});

		productLogic.createMany(postData.item_list, function(tempProductList){
			if(tempProductList && tempProductList.status == 'success'){
				_.forEach(tempProductList.data, function(product){
					createdProducts[product.product_name] = product.uuid;
				});
				createProducts(null);
			}
		});

	}, function(addItems){

		_.forEach(postData.item_list, function(item){
			item["orderUuid"] = order.uuid;
			item["product_id"] = createdProducts[item.product_name];
		});

		itemLogic.createMany(postData.item_list, function(tempItemList){
			if(tempItemList && tempItemList.status == 'success'){
				addItems(null);
			}
			else if(tempItemList && tempItemList.status == 'error'){
				errorData = tempItemList;
				addItems("Cannot insert items");
			}

		});

	}, function(receiveThisOrder){

		receiveOrder(order.uuid, function(newOrderData){
			console.log(newOrderData);
			if(newOrderData && newOrderData.status == 'success'){
				order = newOrderData;
				next({"status": "success", "data": order});
				receiveThisOrder(null);
			}
			else{
				errorData = newOrderData;
				receiveThisOrder("Error while confirming this order");
			}
		});

	}], function(err){
		if(err){
			next(errorData);
			return;
		}
	});
};

exports.createByOperator = createByOperator;



