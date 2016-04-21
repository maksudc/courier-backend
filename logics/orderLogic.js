var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var orderModel = sequelize.models.order;
var regionalBranch = require("./regionalBranchLogic");
var subBranchLogic = require("./subBranchLogic");
var itemLogic = require("./itemLogic");
var clientLogic = require("./clientLogic");
var subBranchLogic = require("./subBranchLogic");
var adminLogic = require("./admin/adminLogic");
var _ = require("lodash");
var async = require("async");


var findOne = function(id, next){
	if(!id){
		next({"status":"error", "message": "Id required"});
		return;
	}

	orderModel.findOne({where: {uuid: id}}).then(function(order){

		if(order) next({"status": "success", "data": order});
		else next({"status":"error", message:"No order found by this id"});

	}).catch(function(err){
		if(err){
			console.log(err);
			next({"status":"error", "message": "Error occurred while searching order"});
		}
	});
};


exports.findOne = findOne;


var findAllOrders = function(params, next){

	orderModel.findAll({where: params}).then(function(orderList){
		if(orderList){

			var idList = [];

			_.forEach(orderList, function(singleOrder){
				if(idList.indexOf(parseInt(singleOrder.entry_branch)) < 0)
					idList.push(parseInt(singleOrder.entry_branch));
				if(idList.indexOf(parseInt(singleOrder.exit_branch)) < 0)
					idList.push(parseInt(singleOrder.exit_branch));
			});

			var branchLabels = {};

			subBranchLogic.findByIdList(idList, function(branchList){

				if(branchList.status == 'error'){
					next({"status": "error", "message": "Error while reading branch names"});
					return;
				}

				_.forEach(branchList.data, function(singleBranch){
					singleBranch.dataValues.regionalBranch = singleBranch.regionalBranch;
					branchLabels[singleBranch.dataValues.id] = singleBranch.dataValues;
				});

				_.forEach(orderList, function(singleOrder){
					if(branchLabels[singleOrder.dataValues.entry_branch])
					{
						singleOrder.dataValues.entry_branch = branchLabels[singleOrder.dataValues.entry_branch];
						singleOrder.dataValues["entry_branch_id"] = singleOrder.dataValues.entry_branch.id;
					}
					if(branchLabels[singleOrder.dataValues.exit_branch])
					{
						singleOrder.dataValues.exit_branch = branchLabels[singleOrder.dataValues.exit_branch];
						singleOrder.dataValues["exit_branch_id"] = singleOrder.dataValues.exit_branch.id;
					}

				});

				next({"status": "success", data: orderList});
			});


		}
		else{
			next({"status": "success", "message": "No order found!!!"});
		}
	}).catch(function(err){
		if(err){
			console.log(err);
			next({"status": "error", "message": "Error while getting all orders"});
			return;
		}
	});

};

exports.findAllOrders = findAllOrders;


var findAllOrdersByMobile = function(params, next){

	orderModel.findAll({where: params}).then(function(orderList){
		if(orderList){

			var idList = [];

			_.forEach(orderList, function(singleOrder){
				if(idList.indexOf(parseInt(singleOrder.entry_branch)) < 0)
					idList.push(parseInt(singleOrder.entry_branch));
				if(idList.indexOf(parseInt(singleOrder.exit_branch)) < 0)
					idList.push(parseInt(singleOrder.exit_branch));
			});

			var branchLabels = {};

			subBranchLogic.findByIdList(idList, function(branchList){

				if(branchList.status == 'error'){
					next({"status": "error", "message": "Error while reading branch names"});
					return;
				}

				_.forEach(branchList.data, function(singleBranch){
					branchLabels[singleBranch.dataValues.id] = singleBranch.dataValues;
				});

				_.forEach(orderList, function(singleOrder){
					if(branchLabels[singleOrder.dataValues.entry_branch])
						singleOrder.dataValues.entry_branch = branchLabels[singleOrder.dataValues.entry_branch];
					if(branchLabels[singleOrder.dataValues.exit_branch])
						singleOrder.dataValues.exit_branch = branchLabels[singleOrder.dataValues.exit_branch];

				});

				next({"status": "success", data: orderList});
			});

		}
		else{
			next({"status": "success", "message": "No order found!!!"});
		}
	}).catch(function(err){
		if(err){
			console.log(err);
			next({"status": "error", "message": "Error while getting all orders"});
			return;
		}
	});

};

exports.findAllOrdersByMobile = findAllOrdersByMobile;



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

	orderModel.create(draftOrder).then(function(order){
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
	}).catch(function(err){
		if(err){
			next({"status": "error","message": "Error occured while creating order"});
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


var confirmOrder = function(id, code, next){
	findOne(id, function(orderData){

		if(orderData.status == 'success' && orderData.data.status == 'draft'){
			
			orderData.data.status = 'confirmed';
			orderData.data.confirm_time = new Date();
			orderData.data.save().then(function(newOrderData){
				if(newOrderData){
					next({"status": "success", "data": newOrderData.dataValues});
				}
				else{
					next({"status": "error", "message": "Unknown error while saving status"});
				}

				return;
			}).catch(function(err){
				if(err){
					next({"status": "error", "message": "Error while saving status"});
					return;
				}
			});
		}
		else return next({"status": "error", "message": "Cannot confirm this order"});
	});
}

exports.confirmOrder = confirmOrder;


var receiveOrder = function(id, operator, next){
	findOne(id, function(orderData){
		if(orderData.status == 'success'){
			if(orderData.data.status == 'draft'){
				return next({"status": "error", "message": "Please confirm this order first"});
			}

			orderData.data.status = 'received';
			orderData.data.receiver_operator = operator.email;
			orderData.data.receive_time = new Date();
			orderData.data.save().then(function(newOrderData){
				if(newOrderData){
					next({"status": "success", "data": newOrderData.dataValues});
				}
				else{
					next({"status": "error", "message": "Unknown error while saving status"});
				}

				return;
			}).catch(function(err){
				if(err){
					next({"status": "error", "message": "Error while saving status"});
					return;
				}
			});
		}
		else next(orderData);
	});
}

exports.receiveOrder = receiveOrder;


var deliverOrder = function(id, operator, next){
	findOne(id, function(orderData){
		if(orderData.status == 'success'){

			if(orderData.data.status == 'delivered'){
				next({"status": "error", "message": "Sorry, this order is already delivered"});
				return;
			}

			//This block will be under else if block of status == 'reached'
			orderData.data.status = 'delivered';
			orderData.data.delivery_operator = operator.email;
			orderData.data.delivery_time = new Date();
			orderData.data.save().then(function(newOrderData){
				if(newOrderData){
					next({"status": "success", "data": newOrderData.dataValues});
				}
				else{
					next({"status": "error", "message": "Unknown error while saving status"});
				}

				return;
			}).catch(function(err){
				if(err){
					next({"status": "error", "message": "Error while saving status"});
					return;
				}
			});
		}
		else next(orderData);
	});
}

exports.deliverOrder = deliverOrder;



var receivePayment = function(paymentData, operator, next){

	findOne(paymentData.id, function(orderData){
		if(orderData.status == 'success'){

			if(orderData.data.payment_status == 'paid'){
				next({"status": "error", "message": "Sorry, this order is already paid"});
				return;
			}

			orderData.data.payment_status = 'paid';
			orderData.data.payment_operator = operator.email;

			//Check if payment is not the same, then if the initiator is branch operator or not

			
			orderData.data.save().then(function(newOrderData){
				if(newOrderData){
					next({"status": "success", "data": newOrderData.dataValues});
				}
				else{
					next({"status": "error", "message": "Unknown error while saving status"});
				}

				return;
			}).catch(function(err){
				if(err){
					next({"status": "error", "message": "Error while saving status"});
					return;
				}
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
		subBranchLogic.findOneById(branchId, function(branchData){
			return next(branchData);
		});
	}
	else {
		return next({"status": "error", "message": "branch type did not match"});
	}

};

var createByOperator = function(postData, operator, next){

	/*For first release:
	create draft --> createProducts --> add items --> receive this product(add operator id by login information)*/
	var createdProducts = {}, itemList, order, errorData, adminData;

	async.series([
	function(setOperatorCredentials){

		console.log("Reading admins");
		if(!postData.admin) postData["admin"] = 'tariqul.isha@gmail.com';

		if(operator) {
			//when http-authentication is set, we will read data from req.user
			postData["receiver_operator"] = operator.email;
			if(operator.sub_branch_id){
				postData["entry_branch"] = operator.sub_branch_id;
				postData["entry_branch_type"] = 'sub-branch';
			}
			else{
				postData["entry_branch"] = operator.regional_branch_id;
				postData["entry_branch_type"] = 'regional-branch';
			}

			setOperatorCredentials(null);
		}
		else{
			adminLogic.findAdmin(postData["admin"], function(err, admin){
				if(err){
					setOperatorCredentials("error while reading admin");
				}
				else if(admin){
					console.log(admin);
					postData["receiver_operator"] = admin.email;
					//setOperatorCredentials("testing is going on");
					setOperatorCredentials(null);
				}
			});
		}


	},
	function(testBranches){

		/*
		On 30th march, we assumed that there will be only one parameter named exit_branch_id
		which will be regional branch. entry branch must be read from operator table (his working branch)
		In future, exit_branch_id may come from regionalBranch or subBranch table. If anything wrong happens
		then, blame munna
		*/
		console.log("Setting branches");
 		// @// TODO: Integrate regional branch as entry or exit
		subBranchLogic.findOneById(parseInt(postData.exit_branch_id), function(branch){
			if(branch.status == "error") testBranches(branch.message);
			else {
				postData["exit_branch_id"] = branch.data.id;
				postData["exit_branch_type"] = "sub-branch";

				/*setting some dummy data for entry branch type and entry branch id.
				 This will be read from req.user*/

				 //Set dummy data if no oprator working branch is defined
				if(!postData["entry_branch"]) postData["entry_branch"] = "2";
				if(!postData["entry_branch_type"]) postData["entry_branch_type"] = "sub-branch";

				testBranches(null);
			}
		});

	},function(createDraft){
		console.log("Creating order");

		var message = "";

		if(!postData) message = "No information provied!";
		else if(!postData.sender) message = "Sender required";
		else if(!postData.receiver) message = "Receiver required";
		else if(!postData.item_list) message = "Items required";
		else if(!postData.total_price) message = "Price not set!";
		else if(parseInt(postData.total_price) <= 0) message = "Price cannot be zero or less!";

		if(message != ""){
			next({"status": "error", "message": message});
			return;
		}


		var draftOrder = {
			sender: postData.sender,
			receiver: postData.receiver,
			entry_branch: postData["entry_branch"],
			exit_branch: postData["exit_branch_id"],
			entry_branch_type: postData["entry_branch_type"],
			exit_branch_type: postData["exit_branch_type"],
			payment: parseInt(postData["total_price"])
		};

		if(postData.sender_addr) draftOrder["sender_addr"] = postData.sender_addr;
		if(postData.receiver_addr) draftOrder["receiver_addr"] = postData.receiver_addr;
		if(postData.home_delivery) draftOrder["deliveryType"] = 'home';
		if(postData.payment) draftOrder["payment"] = parseFloat(postData.payment);
		if(postData.nid) draftOrder["nid"] = postData.nid;
		if(postData.receiver_operator) draftOrder["receiver_operator"] = postData.receiver_operator;

		orderModel.create(draftOrder).then(function(tempOrder){
			if(tempOrder && tempOrder.dataValues){
				order = tempOrder.dataValues;
				console.log(order.uuid);
				return createDraft(null);
			}
			else {
				return createDraft("Cannot create order");
			}
		}).catch(function(err){
			if(err){
				console.log(err);
				errorData = err;
				return createDraft("Cannot create draft order");
			}
		});


	}, function(addItems){
		console.log("Adding items");

		var seperateItems = [];

		_.forEach(postData.item_list, function(item){
			
			if(parseInt(item["amount"])>1){
				var length = parseInt(item["amount"]);

				var barCode = order.bar_code.toString() + '-' + order.entry_branch.toString() + '-' + order.exit_branch.toString() + '-';
				
				for(var i=0; i<length; i++) {
					var singleItem = { 
					  amount: 1,
					  price: item["price"],
					  product_name: item["product_name"],
					  unit: item["unit"],
					  length: item["length"],
					  width: item["width"],
					  height: item["height"],
					  weight: item["weight"],
					  bar_code: barCode + i.toString(),
					  orderUuid: order.uuid
					}
					
					seperateItems.push(singleItem);
				}

			}
			else{
				item["bar_code"] = order.bar_code.toString() + '-' + 
					order.entry_branch.toString() + '-' + 
					order.exit_branch.toString() + '-0';
				item["orderUuid"] = order.uuid;
				seperateItems.push(item);
			}
		});

		delete postData["item_list"];

		itemLogic.createMany(seperateItems, function(tempItemList){
			if(tempItemList && tempItemList.status == 'success'){
				addItems(null);
			}
			else if(tempItemList && tempItemList.status == 'error'){
				errorData = tempItemList;
				addItems("Cannot insert items");
			}

		});

	}, function(createClient){
		console.log("Creating client");

		var clientData = {};

		if(postData.sender) clientData["mobile"] = postData.sender;
		if(postData.sender_addr) clientData["address"] = postData.sender_addr;
		if(postData.nid) clientData["national_id"] = postData.nid;
		if(postData.senderRegion) clientData["regionId"] = postData.senderRegion;
		if(postData.sender_name) clientData["full_name"] = postData.sender_name;

		clientLogic.create(clientData, function(data){

			if(data.status == "success"){
				return next({"status": "success", "data": order});
			}
			else createClient("Cannot create client!");

		});

	}], function(err){
		if(err){
			console.log(err);
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



//Get details to show only. No item id will be provided here
var orderDetailView = function(id, next){

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
			var itemNameList = [];
			var itemDetails = [];
			if(itemList.status == "success"){
				//orderDetails["data"]["items"] = itemList.data;
				_.forEach(itemList.data, function(singleItem){
					var identificationString = singleItem.product_name + ' ' + 
						singleItem.length.toString() + 'x' +
						singleItem.height.toString() + 'x' + 
						singleItem.width.toString() + 'x' + 
						singleItem.weight.toString() + 'x' + 
						singleItem.unit;
					
					if(itemNameList.indexOf(identificationString) < 0)
						itemNameList.push(identificationString);

					var index = itemNameList.indexOf(identificationString);
					if(index < itemDetails.length){
						itemDetails[index].amount = itemDetails[index].amount + 1;
					}
					else{
						itemDetails.push({
							amount: 1,
						    unit: singleItem["unit"],
						    price: singleItem["price"],
						    product_name: singleItem["product_name"],
						    length: singleItem["length"],
						    width: singleItem["width"],
						    height: singleItem["height"],
						    weight: singleItem["weight"]
						});
					}
				});
				delete itemList["data"];
				orderDetails["data"]["items"] = itemDetails;
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

exports.orderDetailView = orderDetailView;




var updateBranch = function(id, next){

};

exports.updateBranch = updateBranch;

var findOrderByClient = function(mobile, next){

	orderModel.findAll({where: {sender: mobile}}).then(function(orderList){

		if(orderList){
			next(null, orderList);
		}
		else next(null, false);

	}).catch(function(err){

		if(err){
			console.log(err);
			next(err);
		}

	});

}

exports.findOrderByClient = findOrderByClient;


var updateStatus = function(data, next){

	orderModel.findOne({where: {uuid: data.id}}).then(function(order){
		
		if(order){
			order.status = data.status;
			order.save().then(function(updatedOrder){
				if(updatedOrder){
					next(null, updatedOrder);
				}
				else next("cannot update order");
			}).catch(function(err){
				if(err){
					console.log(err);
					next(err);
				}
			});
		}
		else next(null, false);

	}).catch(function(err){
		if(err){
			console.log(err);
			next(err);
		}
	});
}

exports.updateStatus = updateStatus;