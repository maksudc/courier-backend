var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var orderModel = sequelize.models.order;
var regionalBranchLogic = require("./regionalBranchLogic");
var subBranchLogic = require("./subBranchLogic");
var branchLogic = require("./branchLogic");
var itemLogic = require("./itemLogic");
var clientLogic = require("./clientLogic");
var moneyLogic = require("./moneyLogic");
var subBranchLogic = require("./subBranchLogic");
var adminLogic = require("./admin/adminLogic");
var _ = require("lodash");
var async = require("async");
var config = require("./../config");


var findOne = function(id, next){
	if(!id){
		next({"status":"error", "message": "Id required"});
		return;
	}

	orderModel.findOne({where: {uuid: id}}).then(function(order){

		if(order) {
			if(order.dataValues.type == 'value_delivery'){
				console.log("Value delivery");
				order.getMoney_order().then(function(moneyOrder){
					console.log("Money order");
					console.log(moneyOrder);
					if(moneyOrder){
						console.log("Money order found");
						order.dataValues["vd_status"] = moneyOrder.dataValues.status;
						order.dataValues["vd_id"] = moneyOrder.dataValues.id;
						next({"status": "success", "data": order});
					}
					else next({"status":"error", "message": "No money parcel found against this vd!"});
				});
			}
			else next({"status": "success", "data": order});
		}
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

			var idList = [], count = 0, orderLength = orderList.length;
			var branchList = {
				"sub": [],
				"regional": []
			};
			//use async.whilst

			async.whilst(
			    function () { return count < orderLength; },
			    function (callback) {

			    	if(!orderList[count].entry_branch || !orderList[count].exit_branch
			    		|| !orderList[count].entry_branch_type || !orderList[count].exit_branch_type){
			    		console.log("*******************Invalid entry or exit************************");
			    		count++;
			    		return callback(null);
			    	}

			    	var entryType = 'regional', exitType = 'regional';
			    	if(orderList[count].dataValues.entry_branch_type == 'sub-branch')
			    		entryType = 'sub';

			    	if(orderList[count].dataValues.exit_branch_type == 'sub-branch')
			    		exitType = 'sub';

			    	var entry_branch_id = orderList[count].entry_branch.toString();
			    	var exit_branch_id = orderList[count].exit_branch.toString();

			    	async.series([function(findEntryBranch){

			    		if(branchList[entryType][entry_branch_id]){
			    			//console.log("Found entry branch");

							findEntryBranch(null);
			    		}
			    		else branchLogic.getBranch(entryType, parseInt(entry_branch_id), function(branchData){
			    			//console.log("Fetching entry branch");

			    			if(branchData.status == 'error'  || !branchData.data || !branchData.data.dataValues){
			    				console.log("No information found for entry branch: " + entry_branch_id);
			    				branchList[entryType][entry_branch_id] = "No information about this branch";
			    				findEntryBranch(null);
			    			}
			    			else{
			    				branchList[entryType][entry_branch_id] = branchData.data.dataValues;
			    				if(entryType == 'sub'){
			    					branchData.data.getRegionalBranch().then(function(regionalBranch){
			    						if(regionalBranch){
			    							branchList[entryType][entry_branch_id]["regionalBranch"] = {
			    								id: regionalBranch.dataValues.id,
			    								label: regionalBranch.dataValues.label
			    							};
			    						}
			    						findEntryBranch(null);
			    					});
			    				}
			    				else findEntryBranch(null);
			    			}
			    		});

			    	}, function(setEntryBranch){

			    		orderList[count].dataValues.entry_branch = branchList[entryType][entry_branch_id];
						orderList[count].dataValues["entry_branch_id"] = entry_branch_id;

						setEntryBranch(null);

			    	}, function(findExitBranch){

			    		if(branchList[exitType][exit_branch_id]){
			    			//console.log("Found exit branch");

			    			findExitBranch(null);
			    		}
			    		else branchLogic.getBranch(exitType, parseInt(exit_branch_id), function(branchData){
			    			console.log("Fetching exit branch");

			    			if(branchData.status == 'error' || !branchData.data || !branchData.data.dataValues){
			    				console.log("No inforamtion found for exit branch: " + exit_branch_id);
			    				branchList[exitType][exit_branch_id] = "No information about this branch";
			    				findExitBranch(null);
			    			}
			    			else{
			    				branchList[exitType][exit_branch_id] = branchData.data.dataValues;
			    				if(exitType == 'sub'){
			    					branchData.data.getRegionalBranch().then(function(regionalBranch){
			    						if(regionalBranch){
			    							branchList[exitType][exit_branch_id]["regionalBranch"] = {
			    								id: regionalBranch.dataValues.id,
			    								label: regionalBranch.dataValues.label
			    							};
			    						}
			    						findExitBranch(null);
			    					});
			    				}
			    				else findExitBranch(null);
			    			}

			    		});

			    	}, function(setExitBranch){

			    		orderList[count].dataValues.exit_branch = branchList[exitType][exit_branch_id];
						orderList[count].dataValues["exit_branch_id"] = exit_branch_id;

						//console.log("Setting exit branch");

						count++;
		    			callback(null);
		    			setExitBranch(null);

			    	}], function(err){
			    		if(err){
			    			console.log(err);
			    			count++;
			    			callback(null);
			    		}
			    	});

			    },
			    function (err) {
			        // 5 seconds have passed, n = 5
			        next({"status": "success", data: orderList});
			    }
			);


			/*
			_.forEach(orderList, function(singleOrder){
				if(idList.indexOf(parseInt(singleOrder.entry_branch)) < 0 && !isNaN(parseInt(singleOrder.entry_branch)))
					idList.push({id: parseInt(singleOrder.entry_branch), type: singleOrder.entry_branch_type});
				if(idList.indexOf(parseInt(singleOrder.exit_branch)) < 0 && !isNaN(parseInt(singleOrder.exit_branch)))
					idList.push({id: parseInt(singleOrder.exit_branch), type: singleOrder.exit_branch_type});
			});

			var branchLabels = {};

			subBranchLogic.findBranchesByIdList(idList, function(branchList){

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
			*/


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
			else if( (orderData.data.dataValues.exit_branch_type == 'sub-branch' && parseInt(orderData.data.dataValues.exit_branch)!= operator.sub_branch_id)
				|| (orderData.data.dataValues.exit_branch_type == 'regional-branch' && parseInt(orderData.data.dataValues.exit_branch)!= operator.regional_branch_id)
			){
				console.log("Other branch's order");
				next({"status": "error", "message": "Sorry, this order is not of your branch!"});
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

			async.series([function(checkCurrentStatus){

				if(orderData.data.payment_status == 'paid'){

					if(orderData.data.dataValues.type == 'general')
						next({"status": "error", "message": "Sorry, this order is already paid"});
					else
						next({"status": "paid", payment: orderData.data.dataValues.payment});
					return;
				}
				else if(orderData.data.dataValues.type == 'value_delivery'){
					orderData.data.getMoney_order().then(function(moneyOrderData){
						if(!moneyOrderData) return next({"status": "error", message: "Cannot update money order!"});
						else checkCurrentStatus(null);
					})
				}
				else if(parseFloat(orderData.data.payment) != parseFloat(paymentData.payment)){
					if(operator.role == config.adminTypes.branch_operator.type
						|| operator.role == config.adminTypes.super_admin.type){
						orderData.data.payment = parseFloat(paymentData.payment);
						checkCurrentStatus(null);
					}
					else {
						return next({"status": "error", "message": "Edit permission is not allowed for u!"});
					}
				}
				else checkCurrentStatus(null);


			}, function(updateOrder){

				orderData.data.payment_status = 'paid';
				orderData.data.pay_time = new Date();
				orderData.data.payment_operator = operator.email;

				orderData.data.save().then(function(newOrderData){

					if(newOrderData) next({"status": "success", "data": newOrderData.dataValues});
					else next({"status": "error", "message": "Unknown error while saving status"});

				}).catch(function(err){
					if(err){
						next({"status": "error", "message": "Error while saving status"});
						return;
					}
				});

			}],
			function(err){
				if(err){
					console.log(err);
					next(err);
				}
			});
		}
		else next(orderData);
	});
}

exports.receivePayment = receivePayment;


function findBranch(branchType, branchId, next){

	if(branchType == 'regional-branch'){
		regionalBranchLogic.findOneById(branchId, function(branchData){
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
	var createdProducts = {}, itemList, order, errorData, adminData, exitBranch;

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

		// subBranchLogic.findOneById(parseInt(postData.exit_branch_id), function(branch){
		// 	if(branch.status == "error") testBranches(branch.message);
		// 	else {
		// 		postData["exit_branch_id"] = branch.data.id;
		// 		postData["exit_branch_type"] = "sub-branch";
		// 		exitBranch = branch.data;

		// 		setting some dummy data for entry branch type and entry branch id.
		// 		 This will be read from req.user

		// 		 //Set dummy data if no oprator working branch is defined
		// 		if(!postData["entry_branch"]) postData["entry_branch"] = "2";
		// 		if(!postData["entry_branch_type"]) postData["entry_branch_type"] = "sub-branch";

		// 		testBranches(null);
		// 	}
		// });

		branchLogic.getBranch(postData["exit_branch_type"], postData["exit_branch_id"], function(branchData){
			if(branchData.status == 'success'){
				postData["exit_branch_type"] = postData["exit_branch_type"] + '-branch';
				exitBranch = branchData.data.dataValues;
				console.log("Exit branch**********");
				console.log(exitBranch);
				console.log("**********************")
				testBranches(null);
			}
			else{
				testBranches("Error while setting exit branch");
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
		if(postData.order_vat != '0') draftOrder["vat"] = true;
		if(postData.type == 'vd') draftOrder["type"] = 'value_delivery';
		if(postData.receiver_name) draftOrder["receiver_name"] = postData.receiver_name;



		orderModel.create(draftOrder).then(function(tempOrder){
			if(tempOrder && tempOrder.dataValues){
				order = tempOrder.dataValues;
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

	}, function(createMoneyOrder){

		if(postData.type!='vd') createMoneyOrder(null);
		else{

			var moneyData = {
				sender_full_name: postData.receiver_name,
				sender_mobile: postData.receiver,
				sender_nid: '',
				receiver_full_name: postData.sender_name,
				receiver_mobile: postData.sender,
				receiver_nid: '',
				regionalBranch: operator.regional_branch_id || null,
				subBranch: operator.sub_branch_id || null,
				source_regional_branch_id: parseInt(exitBranch.regionalBranchId),
				source_sub_branch_id: parseInt(exitBranch.id),
				amount: postData.vd_amount,
				charge: postData.vd_charge,
				discount: postData.vd_discount,
				payable: postData.vd_payable,
				type: 'virtual_delivery',
				money_order_id: order.uuid,
				payParcelPrice: postData["vd_payBySender"],
				parcelPrice: parseInt(order.payment)
			}

			moneyLogic.create(operator, moneyData, function(err, moneyOrderData){
				if(err) {
					createMoneyOrder(err);
				}
				else if(!moneyOrderData) {
					console.log("Money order creation error");
					createMoneyOrder("No money order created");
				}
				else {
					console.log("Money order created corresponding to vd");
					createMoneyOrder(null);
				}
			});
		}

	},function(addItems){
		console.log("Adding items");

		var seperateItems = [];
		var barCode = order.bar_code.toString() + '-';
		var itemCount = 0;

		_.forEach(postData.item_list, function(item){

			if(parseInt(item["amount"])>1){
				var length = parseInt(item["amount"]);

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
					  bar_code: barCode + itemCount.toString(),
					  orderUuid: order.uuid
					}

					itemCount++;
					seperateItems.push(singleItem);
				}

			}
			else{
				item["bar_code"] = barCode + itemCount.toString();
				itemCount++;
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
				//return next(orderDetails);
				getItems(null);
			}
			else{
				errorData = itemList;
				findOrder(errorData);
			}
		});

	}, function(getEntryBranch){

		var entry_branch_id = parseInt(orderDetails.data.orderData.dataValues.entry_branch);
		var entry_branch_type = orderDetails.data.orderData.dataValues.entry_branch_type == 'regional-branch'? 'regional' : 'sub';

		if(!entry_branch_id){
			orderDetails.data.orderData.dataValues["entry_branch_label"] = 'No Entry branch!';
			getEntryBranch(null);
		}
		else branchLogic.getBranch(entry_branch_type, entry_branch_id, function(branchData){

			if(branchData.status == 'success') orderDetails.data.orderData.dataValues["entry_branch_label"] = branchData.data.dataValues.label;
			else orderDetails.data.orderData.dataValues["entry_branch_label"] = 'Error while getting entry branch';
			getEntryBranch(null);
		});

	}, function(getExitBranch){

		var exit_branch_type = orderDetails.data.orderData.dataValues.exit_branch_type == 'regional-branch'? 'regional' : 'sub';
		var exit_branch_id = parseInt(orderDetails.data.orderData.dataValues.exit_branch);

		console.log(exit_branch_type);
		console.log(exit_branch_id);

		if(!exit_branch_id){
			orderDetails.data.orderData.dataValues["exit_branch_label"] = 'No Entry branch!';
			return next(orderDetails);
			getExitBranch(null);
		}
		else branchLogic.getBranch(exit_branch_type, exit_branch_id, function(branchData){

			console.log(branchData);

			if(branchData.status == 'success') orderDetails.data.orderData.dataValues["exit_branch_label"] = branchData.data.dataValues.label;
			else orderDetails.data.orderData.dataValues["exit_branch_label"] = 'Error while getting entry branch';
			//return next(orderDetails);
			getExitBranch(null);
		});

	}, function(getClient){

		console.log("Get client name");

		clientLogic.findNameByMobile(orderDetails.data.orderData.dataValues.sender, function(err, full_name){

			if(full_name){
				orderDetails.data.orderData.dataValues["sender_name"] = full_name;
				return next(orderDetails);
			}
			else {
				getClient("Error while getting client name");
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

var addItem = function(additionalData, operator, next){

	console.log(additionalData);
	var parentOrder, newPrice, existingItemCount;

	async.series(
		[function(checkStatus){
			orderModel.findOne({where: {uuid: additionalData.uuid}})
				.then(function(orderData){
					if(orderData){
						parentOrder = orderData;
						if(parentOrder.dataValues.status == 'draft' || !parentOrder.dataValues.shipmentUuid){
							checkStatus(null);
						}
						else{
							checkStatus("You cannot add any item into this order. Not in right status");
						}
					}
					else checkStatus("No order found by this id");
				})
				.catch(function(err){
					if(err) checkStatus(err);
				});
		}, function(addPayment){

			newPrice = parseFloat(parentOrder.dataValues.payment) + parseFloat(additionalData.total_price);
			addPayment(null);

		}, function(countItem){

			itemLogic.getItemCount(additionalData.uuid, function(err, itemCount){
				if(err) countItem(err);
				else{
					existingItemCount = parseInt(itemCount);
					countItem(null);
				}
			});

		}, function(addItems){
			console.log("Adding items");

			var seperateItems = [];

			var barCode = parentOrder.dataValues.bar_code.toString() + '-';

			_.forEach(additionalData.item_list, function(item){

				if(parseInt(item["amount"])>1){
					var length = parseInt(item["amount"]);

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
						  bar_code: barCode + existingItemCount.toString(),
						  orderUuid: parentOrder.dataValues.uuid
						}
						existingItemCount++;

						seperateItems.push(singleItem);
					}

				}
				else{
					item["bar_code"] = barCode + existingItemCount.toString();
					item["orderUuid"] = parentOrder.dataValues.uuid;
					seperateItems.push(item);
				}
			});

			delete additionalData["item_list"];

			itemLogic.createMany(seperateItems, function(tempItemList){
				if(tempItemList && tempItemList.status == 'success'){
					parentOrder.payment = newPrice;
					parentOrder.save();
					next(null, parentOrder.dataValues);
				}
				else if(tempItemList && tempItemList.status == 'error'){
					errorData = tempItemList;
					addItems("Cannot insert items");
				}

			});

		}],
		function(err){
			if(err){
				console.log(err);
				next(err);
			}
		});

}
exports.addItem = addItem;

var branchUtils = require("../utils/branch");
var HttpStatus = require("http-status-codes");
var Promise = require("bluebird");

var getAnalytics = function(params , next){

		var branchOperation = null;
		var branchId = null;
		var branchType = null;

		var status = null;
		var payment_status = null;
		var type = null;
		var deliveryType = null;
		var isVd = null;

		var startTime = null;
		var endTime = null;
		var count = false;

		branchOperation = params.branchOperation;
		branchId = params.branchId;
		branchType = branchUtils.sanitizeBranchType(params.branchType);

		status = params.status;
		payment_status = params.payment_status;
		type = params.type;
		deliveryType = params.deliveryType;
		isVd = params.isVd;

		startTime = params.startTime;
		endTime = params.endTime;

		var whereQuery = {};

		if(branchOperation == "entry"){

			if(branchType){
				whereQuery.entry_branch_type = branchUtils.desanitizeBranchType(branchType);
			}
			if(branchId){
				whereQuery.entry_branch_id = branchId;
			}

		}else if(branchOperation == "exit"){

			if(branchType){
				whereQuery.exit_branch_type = branchUtils.desanitizeBranchType(branchType);
			}
			if(branchId){
				whereQuery.exit_branch = branchId;
			}

		}else if(branchOperation == "current"){

			if(branchType){
				whereQuery.current_hub_type = branchUtils.sanitizeBranchType(branchType);
			}
			if(branchId){
				whereQuery.current_hub = branchId;
			}

		}else if(branchOperation == 'next'){

			if(branchType){
				whereQuery.next_hub_type = branchUtils.sanitizeBranchType(branchType);
			}
			if(branchId){
				whereQuery.next_hub = branchId;
			}
		}else{}

		//@todo Do the rwherequey construction for the remaining fields
		if(status){
			whereQuery.status = status;
		}
		if(payment_status){
			whereQuery.payment_status = payment_status;
		}
		if(type){
			whereQuery.type = type;
		}
		if(deliveryType){
			whereQuery.deliveryType = deliveryType;
		}

		var startTimeObject = null;//new Date(startTime);
		var endTimeObject = null; //new Date(endTime);

		if(startTime){
			startTimeObject = new Date(parseInt(startTime));
		}
		if(endTime){
			endTimeObject = new Date(parseInt(endTime));
		}

		console.log(JSON.stringify(startTime));
		console.log(JSON.stringify(endTime));

		console.log(JSON.stringify(startTimeObject));
		console.log(JSON.stringify(endTimeObject));

		if(startTimeObject && endTimeObject){

			// @TODO add validation for ending time > starting time

				whereQuery.createdAt = {
					$gte: startTimeObject,
					$lte: endTimeObject
					//$between:[ startTimeObject , endTimeObject ]
				};
		}else if(startTimeObject){

				whereQuery.createdAt = {
					$gte: startTimeObject
				};
		}else if(endTimeObject){

				whereQuery.createdAt = {
					$lte: endTimeObject
				};
		}

		if(params.count){
			count = params.count;
		}

		var p1 = Promise.resolve(null);

		if(count){
			p1 = orderModel.count({ where: whereQuery });
		}else{
			p1 = orderModel
			.findAll({ where: whereQuery });
		}

		p1.then(function(orderItems){
			next({ status:"success" , statusCode: HttpStatus.OK , data:orderItems , message:null });
			return;
		})
		.catch(function(err){
			next({ status:"error" , statusCode:HttpStatus.INTERNAL_SERVER_ERROR , data:null , message:JSON.stringify(err) });
			return;
		});
}

exports.getAnalytics = getAnalytics;
