var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var orderModel = sequelize.models.order;
var regionalBranch = require("./regionalBranchLogic");
var subBranch = require("./subBranchLogic");
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


var findAllOrders = function(next){

	orderModel.findAll().catch(function(err){
		if(err){
			return next({"status": "error", "message": "Error while getting all orders"});
		}
	}).then(function(orderList){
		if(orderList){
			return next({"status": "success", data: orderList});
		}
		else{
			return next({"status": "success", "message": "No order found!!!"});
		}
	});

};

exports.findAllOrders = findAllOrders;



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
			else if(orderData.data.status == 'delivered'){
				next({"status": "error", "message": "Sorry, this order is already delivered"});
				return;
			}

			//This block will be under else if block of status == 'reached'
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



var receivePayment = function(id, next){
	findOne(id, function(orderData){
		if(orderData.status == 'success'){

			if(orderData.data.payment_status == 'paid'){
				next({"status": "error", "message": "Sorry, this order is already paid"});
				return;
			}

			orderData.data.payment_status = 'paid';
			orderData.data.payment_operator = 'qwedsafsag4w';
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

exports.receivePayment = receivePayment;


function findBranch(branchType, branchId, next){

	if(branchType == 'regional-branch'){
		regionalBranch.findOneById(branchId, function(branchData){
			return next(branchData);
		});
	}
	else if(branchType == 'sub-branch'){
		subBranch.findOneById(branchId, function(branchData){
			return next(branchData);
		});
	}
	else {
		return next({"status": "error", "message": "branch type did not match"});
	}

};

var createByOperator = function(postData, next){

	/*For first release:
	create draft --> createProducts --> add items --> receive this product(add operator id by login information)*/
	var createdProducts = {}, itemList, order, errorData;
	console.log(postData);

	async.series([function(testBranches){

		if(!postData["exit_branch_type"] || !postData["exit_branch_id"] || !postData["entry_branch_type"] || !postData["entry_branch_id"]){
			var message;
			if(!postData["exit_branch_type"]) message = "Exit branch type not definded";
			else if(!postData["exit_branch_id"]) message = "Exit branch id not definded";
			else if(!postData["entry_branch_type"]) message = "Entry branch type not definded";
			else if(!postData["entry_branch_id"]) message = "Entry branch id not definded";

			errorData = {"status": "error", "message": message};
			testBranches(errorData);
		}
		else {
			findBranch(postData["entry_branch_type"], parseInt(postData["entry_branch_id"]), function(entryBranchData){
				if(entryBranchData.status == 'success'){
					findBranch(postData["exit_branch_type"], parseInt(postData["exit_branch_id"]), function(exitBranchData){
						if(exitBranchData.status == 'success'){
							testBranches(null);
						}
						else{
							errorData = exitBranchData;
							errorData.message = errorData.message + " for exit branch";
							testBranches(exitBranchData);
						}
					});
				}
				else{
					errorData = entryBranchData;
					errorData.message = errorData.message + " for entry branch";
					testBranches(errorData);
				}
			});
		}

	},function(createDraft){

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
			entry_branch: postData["entry_branch_id"],
			exit_branch: postData["exit_branch_id"],
			entry_branch_type: postData["entry_branch_type"],
			exit_branch_type: postData["exit_branch_type"]
		};

		if(postData.sender_addr) draftOrder["sender_addr"] = postData.sender_addr;
		if(postData.receiver_addr) draftOrder["receiver_addr"] = postData.receiver_addr;
		if(postData.home_delivery) draftOrder["deliveryType"] = 'home';
		if(postData.payment) draftOrder["payment"] = parseFloat(postData.payment);

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


	}, function(createProductList){
		console.log("creating product items");

		_.forEach(postData.item_list, function(item){
			item["unitPrice"] = parseFloat(item["price"])/parseFloat(item["amount"]);
		});

		productLogic.createMany(postData.item_list, function(tempProductList){
			if(tempProductList && tempProductList.status == 'success'){
				_.forEach(tempProductList.data, function(product){
					createdProducts[product.product_name] = product.uuid;
				});
				createProductList(null);
			}
			else {
				errorData = tempProductList;
				createProductList(errorData);
			}
		});

	}, function(addItems){
		console.log("Adding items");

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
		console.log("Setting status as received");

		receiveOrder(order.uuid, function(newOrderData){
			console.log(newOrderData);
			if(newOrderData && newOrderData.status == 'success'){
				order = newOrderData.data;
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


var orderDetail = function(id, next){

	if(!id){
		next({"status": "error", "message": "Id required"});
		return;
	}

	var errorData, orderDetails = {"status": ""};

	async.series([function(findOrder){

		findOne(id, function(orderData){
			if(orderData.status == "success"){
				orderDetails["status"] = "success";
				orderDetails["data"] = {};
				orderDetails["data"]["orderData"] = orderData.data;
				findOrder(null);
			}
			else{
				errorData = orderData;
				findOrder(orderData);
			}
		});

	}, function(getItems){

		itemLogic.findByOrderId(id, function(itemList){
			if(itemList.status == "success"){
				orderDetails["data"]["items"] = itemList.data;
				return next(orderDetails);
			}
			else{
				errorData = itemList;
				findOrder(errorData);
			}
		});

	}], function(err){
		if(err){
			if(errorData) return next(errorData);
			else return next({"status": "error", "message": "Unknown error"});
		}
	});

};

exports.orderDetail = orderDetail;
