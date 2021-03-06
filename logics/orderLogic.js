var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var orderModel = sequelize.models.order;
var itemModel = sequelize.models.item;
var trackerLog = sequelize.models.trackerLog;
var genericTracker = sequelize.models.genericTracker;
var money = sequelize.models.money;
var clientModel = sequelize.models.client;

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
var handlebars = require("handlebars");
var fs = require("fs");
var messageUtils = require("../utils/message");
var Promise = require("bluebird");
var branchUtils = require("../utils/branch");
var HttpStatus = require("http-status-codes");
var moment = require("moment");
var adminUtils = require("../utils/admin");

var findOne = function(id, next){
	if(!id){
		next({"status":"error", "message": "Id required"});
		return;
	}

	orderModel.findOne({where: {uuid: id}}).then(function(order){

		if(order) {
			if(order.dataValues.type == 'value_delivery'){

				order.getMoney_order().then(function(moneyOrder){

					if(moneyOrder){
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
			console.error(err.stack);
			next({"status":"error", "message": "Error occurred while searching order"});
		}
	});
};


exports.findOne = findOne;


var findAllOrders = function(params, next){

	if(params.range == 'week'){
		var currentDate = new Date();
		currentDate.setDate(currentDate.getDate() - 7);
		params["createdAt"] = {$gt: currentDate};
	}

	delete params["range"];

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

								findEntryBranch(null);
			    		}
			    		else branchLogic.getBranch(entryType, parseInt(entry_branch_id), function(branchData){

			    			if(branchData.status == 'error'  || !branchData.data || !branchData.data.dataValues){			    
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

			    			findExitBranch(null);
			    		}
			    		else branchLogic.getBranch(exitType, parseInt(exit_branch_id), function(branchData){

			    			if(branchData.status == 'error' || !branchData.data || !branchData.data.dataValues){
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

						count++;
		    			callback(null);
		    			setExitBranch(null);

			    	}], function(err){
			    		if(err){
			    			console.error(err.stack);
			    			count++;
			    			callback(null);
			    		}
			    	});

			    },
			    function (err) {
							if(err){
								console.error(err.stack);
							}
			        // 5 seconds have passed, n = 5
			        next({"status": "success", data: orderList});
			    }
			);


		}
		else{
			next({"status": "success", "message": "No order found!!!"});
		}
	}).catch(function(err){
		if(err){
			console.error(err.stack);
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
			console.error(err.stack);
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

var deleteOrder = function(orderUuid , next){

	/**
	 *	Check the permission whether the current user is allowed to delete the order or not
	 */

	 //@todo: Find the order
	 //@todo: If the order is a vd , get the corresponding money order
	 //@todo: if the order is vd , delete the corresponding money order
	 //@todo: Find the tracker
	 //@todo: FInd the items' trackers
	 //@todo: Delete the item
	 //@todo: Delete the order
	 //@todo: Delete all the logs for those trackers
	 //@todo: delete the trackers

	 var orderInstance = null;
	 var trackerInstances = [];
	 var itemUuids = [];
	 var itemTrackerUuids = [];

	 orderModel
	 .findOne({ where: { uuid: orderUuid } })
	 .then(function(orderItem){

		 if(!orderItem){
			 return Promise.reject("Could not found Order");
		 }

		 orderInstance = orderItem;

		 if(orderItem.type == "value_delivery"){
			 // Order is a VD , So delete the redundant money order as well
			 return money
			 .destroy({
				 where: {
					 "type":"virtual_delivery",
					 money_order_id: orderInstance.uuid
				 }
			 });
		 }

			return Promise.resolve(orderItem);
	 })
	 .then(function(result){

		 return orderInstance.getTracker();
	 })
	 .then(function(trackerInstance){
		 if(trackerInstance){
			 return trackerInstance.destroy();
		 }
	 })
	//  .then(function(trackerInstance){
	// 	 if(trackerInstance){
	// 		 	trackerLog.destroy({ where: { trackerId: trackerInstance.uuid } });
	// 	 }
	// 	 return Promise.resolve(trackerInstance);
	//  })
	 .then(function(){
		 return itemModel.destroy({ where: { orderUuid: orderInstance.uuid } });
	 })
	 .then(function(result){
		 return orderInstance.destroy();
	 })
	 .then(function(result){
		 next({ status: "success" , statusCode: HttpStatus.OK , message:"Deleted Successfully" });
	 })
	 .catch(function(err){
		 if(err){
			 console.error(err.stack);
		 }
		 next({statusCode: HttpStatus.INTERNAL_SERVER_ERROR , status: "error" , message: err });
	 });
};

exports.deleteOrder = deleteOrder;


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
					console.error(err.stack);
					next({"status": "error", "message": "Error while saving status"});
					return;
				}
			});
		}
		else return next({"status": "error", "message": "Cannot confirm this order"});
	});
};

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
					console.error(err.stack);
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

            if(orderData.data.due_deliverable==false)
            {
			if(orderData.data.payment_status == 'unpaid'){
				next({"status": "error", "message": "Sorry, please pay the cost first"});
				return;
			}
            else if(orderData.data.status == 'delivered'){
				next({"status": "error", "message": "Sorry, this order is already delivered"});
				return;
			}
			else if( (orderData.data.dataValues.exit_branch_type == 'sub-branch' && parseInt(orderData.data.dataValues.exit_branch)!= operator.sub_branch_id)
				|| (orderData.data.dataValues.exit_branch_type == 'regional-branch' && parseInt(orderData.data.dataValues.exit_branch)!= operator.regional_branch_id)
			){
				next({"status": "error", "message": "Sorry, this order is not of your branch!"});
				return;
			}
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
					console.error(err.stack);
					next({"status": "error", "message": "Error while saving status"});
					return;
				}
			});
		}
		else next(orderData);
	});
}

exports.deliverOrder = deliverOrder;


var receiveVDPayment = function(paymentData, operator, next){

	findOne(paymentData.id, function(orderData){
		if(orderData.status == 'success'){

			async.series([function(checkCurrentStatus){

				if(orderData.data.payment_status == 'paid'){

					if(orderData.data.dataValues.type == 'general')
						next({"status": "error", "message": "Sorry, this order is already paid"});
					else
						next({"status": "paid", payment: orderData.data.dataValues.payment});

					checkCurrentStatus({"status": "paid"});
					return;
				}
				else if(orderData.data.dataValues.type == 'value_delivery'){
					orderData.data.getMoney_order().then(function(moneyOrderData){
						if(moneyOrderData){
							if(!moneyOrderData) return next({"status": "error", message: "Cannot update money order!"});
							else checkCurrentStatus(null);
						}
						else return next({"status": "error", message: "Cannot update money order!"});
					});
				}
				else checkCurrentStatus(null);


			}, function(updateOrder){

				orderData.data.payment_status = 'paid';
				orderData.data.pay_time = new Date();
				orderData.data.payment_operator = operator.email;

				if(!paymentData.payment_branch_type){
					paymentData.payment_branch_type = branchUtils.sanitizeBranchType(adminUtils.getAdminBranchType(operator));
				}
				if(!paymentData.payment_branch_id){
					paymentData.payment_branch_id = adminUtils.getAdminBranchId(operator);
				}
				orderData.data.payment_hub = paymentData.payment_branch_id;
				orderData.data.payment_hub_type = paymentData.payment_branch_type;

				if( orderData.data.entry_branch == paymentData.payment_branch_id && branchUtils.sanitizeBranchType(orderData.data.entry_branch_type) == paymentData.payment_branch_type ){
							orderData.data.payment_tag = "booking";
				}else if(orderData.data.exit_branch == paymentData.payment_branch_id && branchUtils.sanitizeBranchType(orderData.data.exit_branch_type) == paymentData.payment_branch_type){
							orderData.data.payment_tag = "delivery";
				}

				orderData.data.save().then(function(newOrderData){

					if(newOrderData) next({"status": "success", "data": newOrderData.dataValues});
					else next({"status": "error", "message": "Unknown error while saving status"});

				}).catch(function(err){
					if(err){
						console.error(err.stack);
						next({"status": "error", "message": "Error while saving status"});
						return;
					}
				});

			}],
			function(err){
				if(err){
					console.error(err.stack);
					next(err);
				}
			});
		}
		else next(orderData);
	});
}

exports.receiveVDPayment = receiveVDPayment;


var receivePayment = function(paymentData, operator, next){

	findOne(paymentData.id, function(orderData){
		if(orderData.status == 'success'){

			async.series([function(checkCurrentStatus){

				if(orderData.data.payment_status == 'paid'){

					if(orderData.data.dataValues.type == 'general')
						next({"status": "error", "message": "Sorry, this order is already paid"});
					else
						next({"status": "paid", payment: orderData.data.dataValues.payment});

					checkCurrentStatus({"status": "paid"});
					return ;
				}
				else if(orderData.data.dataValues.type == 'value_delivery'){
					orderData.data.getMoney_order().then(function(moneyOrderData){
						if(moneyOrderData){
							if(moneyOrderData.dataValues.payParcelPrice == 'seller'){
								moneyOrderData.payParcelPrice = null;
								moneyOrderData.amount = parseInt(moneyOrderData.dataValues.amount) +
									parseInt(orderData.data.dataValues.payment);
							}
							else if(moneyOrderData.dataValues.payParcelPrice == 'buyer'){
								moneyOrderData.payParcelPrice = null;
								moneyOrderData.payable = parseInt(moneyOrderData.dataValues.payable) -
									parseInt(orderData.data.dataValues.payment);
							}

							moneyOrderData.save();
							checkCurrentStatus(null);
						}
						else {
							return next({"status": "error", message: "Cannot update money order!"});
						}
					});
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

				if(!paymentData.payment_branch_type){
					paymentData.payment_branch_type = branchUtils.sanitizeBranchType(adminUtils.getAdminBranchType(operator));
				}
				if(!paymentData.payment_branch_id){
					paymentData.payment_branch_id = adminUtils.getAdminBranchId(operator);
				}
				orderData.data.payment_hub = paymentData.payment_branch_id;
				orderData.data.payment_hub_type = paymentData.payment_branch_type;

				if( orderData.data.entry_branch == paymentData.payment_branch_id && branchUtils.sanitizeBranchType(orderData.data.entry_branch_type) == paymentData.payment_branch_type ){
							orderData.data.payment_tag = "booking";
				}else if(orderData.data.exit_branch == paymentData.payment_branch_id && branchUtils.sanitizeBranchType(orderData.data.exit_branch_type) == paymentData.payment_branch_type){
							orderData.data.payment_tag = "delivery";
				}

				orderData.data.save().then(function(newOrderData){

					if(newOrderData) next({"status": "success", "data": newOrderData.dataValues});
					else next({"status": "error", "message": "Unknown error while saving status"});

				}).catch(function(err){
					if(err){
						console.error(err.stack);
						next({"status": "error", "message": "Error while saving status"});
						return;
					}
				});

			}],
			function(err){
				if(err){
					console.error(err.stack);
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
					console.error(err.stack);
					setOperatorCredentials("error while reading admin");
				}
				else if(admin){
					postData["receiver_operator"] = admin.email;
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

		branchLogic.getBranch(postData["exit_branch_type"], postData["exit_branch_id"], function(branchData){
			if(branchData.status == 'success'){
				postData["exit_branch_type"] = postData["exit_branch_type"] + '-branch';
				exitBranch = branchData.data.dataValues;

				testBranches(null);
			}
			else{
				testBranches("Error while setting exit branch");
			}
		});

	},function(createDraft){

		var message = "";

		if(!postData) message = "No information provied!";
		else if(!postData.sender) message = "Sender required";
		else if(!postData.receiver) message = "Receiver required";
		else if(!postData.item_list) message = "Items required";
		else if(!postData.total_price) message = "Price not set!";
		else if(parseInt(postData.total_price) <= 0) message = "Price cannot be zero or less!";

		if(message != ""){
			next({"status": "error", "message": message});
			createDraft(message);
			return;
		}

		var draftOrder = {
			sender: postData.sender,
			receiver: postData.receiver,
			entry_branch: postData["entry_branch"],
			exit_branch: postData["exit_branch_id"],
			entry_branch_type: postData["entry_branch_type"],
			exit_branch_type: postData["exit_branch_type"],
			payment: parseInt(postData["total_price"]),
			due_deliverable:postData["due_deliverable"]
		};

		if(postData.order_discount && parseFloat(postData.order_discount)){
			draftOrder["discount"] = postData.order_discount;
		}
		if(postData.sender_addr) draftOrder["sender_addr"] = postData.sender_addr;
		if(postData.receiver_addr) draftOrder["receiver_addr"] = postData.receiver_addr;
		// home_delivery might be here for legacy reason. Needs some testing to remove it. Instead a more general
		// delivery type is added which delegates the responsidbility
		if(postData.home_delivery) draftOrder["deliveryType"] = 'home';
		if(postData.deliveryType){
			draftOrder["deliveryType"] = postData.deliveryType;
		}
		if(postData.payment) draftOrder["payment"] = parseFloat(postData.payment);
		if(postData.nid) draftOrder["nid"] = postData.nid;
		if(postData.receiver_operator) draftOrder["receiver_operator"] = postData.receiver_operator;
		if(postData.order_vat != '0') draftOrder["vat"] = true;
		if(postData.type == 'vd') draftOrder["type"] = 'value_delivery';
		if(postData.receiver_name) draftOrder["receiver_name"] = postData.receiver_name;


		orderModel
		.create(draftOrder)
		.then(function(tempOrder){
			if(tempOrder && tempOrder.dataValues){
				order = tempOrder.dataValues;
				createDraft(null);
			}
			else {
				createDraft("Cannot create order");
			}
		})
		.catch(function(err){
			if(err){
				console.error(err.stack);
			}
			errorData = err;
			createDraft("Cannot create draft order");
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
				parcelPrice: parseInt(order.payment),

			}

			moneyLogic
			.create(operator, moneyData, function(err, moneyOrderData){
				if(err) {
					console.error(err.stack);
					createMoneyOrder(err);
				}
				else if(!moneyOrderData) {
					console.error("Money order creation error");
					createMoneyOrder("No money order created");
				}
				else {

					createMoneyOrder(null);
				}
			});
		}

	},function(addItems){

		var seperateItems = [];
		var barCode = order.bar_code.toString() + '-';
		var itemCount = 0;

		_.forEach(postData.item_list, function(item){

			if(parseInt(item["amount"])>0){
				var length = parseInt(item["amount"]);

				for(var i=0; i<length; i++) {
					singleItem = {
					  amount: 1,
					  price: item["price"],
					  product_name: item["product_name"],
					  unit: item["unit"],
					  bar_code: barCode + itemCount.toString(),
					  orderUuid: order.uuid,
						length: 0,
						width: 0,
						height: 0,
						weight: 0
					};

					if(item["length"] && parseInt(item["length"])){
						singleItem["length"] = parseInt(item["length"]);
					}
					if(item["width"] && parseInt(item["width"])){
						singleItem["width"] = parseInt(item["width"]);
					}
					if(item["height"] && parseInt(item["height"])){
						singleItem["height"] = parseInt(item["height"]);
					}
					if(item["weight"] && parseFloat(item["weight"])){
						singleItem["weight"] = parseFloat(item["weight"]);
					}

					itemCount++;
					seperateItems.push(singleItem);
				}

			}
		});

		delete postData["item_list"];

		if(seperateItems.length == 0){
			return addItems(null);
		}

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

		var clientData = {};
		var client  = null;

		if(postData.sender) clientData["mobile"] = postData.sender;
		if(postData.sender_addr) clientData["address"] = postData.sender_addr;
		if(postData.nid) clientData["national_id"] = postData.nid;
		if(postData.senderRegion) clientData["regionId"] = postData.senderRegion;
		if(postData.sender_name) clientData["full_name"] = postData.sender_name;

		clientLogic.create(clientData, function(data){
			if(data.status == "success"){
				client = data.data;

				fs.readFile("./views/message/client.signup.handlebars" , function(err , content){
					if(err){
						console.error(err.stack);
						return;
					}
					contentTemplate = handlebars.compile(content.toString());
					messageBody = null;

					if(data.isNew){
						// send the password to the client by sms
						// Send the sms with the password
						messageBody = contentTemplate({ parcelInstance: order , client: client });
					}else{
						//Only sends the verifcation code
						messageBody = contentTemplate({ parcelInstance: order });
					}
					messageUtils.sendMessage(client.mobile , messageBody , function(mResponse){
						console.log(mResponse);
					});
					createClient(null);
				});
			}
			else createClient("Cannot create Sender client!");
		});

	}, function(createReceiverClient){

		clientData = {};
		var client = null;

		if(postData.receiver) clientData["mobile"] = postData.receiver;
		if(postData.receiver_name) clientData["full_name"] = postData.receiver_name;
		if(postData.receiver_addr) clientData["address"] = postData.receiver_addr;
		//if(postData.nid) clientData["national_id"] = postData.nid;
		//if(postData.senderRegion) clientData["regionId"] = postData.senderRegion;
		clientLogic.create(clientData, function(data){
			if(data.status == "success"){
				client = data.data;
				createReceiverClient(null);
			}
			else createReceiverClient("Cannot create Receiver client!");
		});

	}], function(err){
		if(err){
			console.error(err.stack);
			next({ "status":"error" , "message":err , "trace":errorData });
			return;
		}
		if(order){
				next({"status": "success", "data": order});
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
				getItems("Can not retrieve items");
			}
		});

	}, function(getEntryBranch){

		var entry_branch_id = parseInt(orderDetails.data.orderData.dataValues.entry_branch);
		var entry_branch_type = orderDetails.data.orderData.dataValues.entry_branch_type == 'regional-branch'? 'regional' : 'sub';

		if(!entry_branch_id){
			orderDetails.data.orderData.dataValues["entry_branch_label"] = 'No Entry branch!';
			getEntryBranch(null);
		}
		else {

			branchUtils
			.getInclusiveBranchInstance(entry_branch_type , entry_branch_id , null)
			.then(function(branchItem){

				if(branchItem == null){
					orderDetails.data.orderData.dataValues["entry_branch_label"] = 'No Entry branch!';
					getEntryBranch(null);
					return Promise.resolve(null);
				}

				if(branchItem.regionalBranch){
					orderDetails.data.orderData.dataValues["entry_branch_label"] = branchItem.label;
					orderDetails.data.orderData.dataValues["entry_regional_branch_label"] = branchItem.regionalBranch.label;
				}else{
					orderDetails.data.orderData.dataValues["entry_branch_label"] = branchItem.label;
					orderDetails.data.orderData.dataValues["entry_regional_branch_label"] = null;
				}

				getEntryBranch(null);
			}).catch(function(err){

				orderDetails.data.orderData.dataValues["entry_branch_label"] = 'Error while getting entry branch';
				orderDetails.data.orderData.dataValues["entry_regional_branch_label"] = null;

				if(err){
						console.error(err.stack);
				}
				getEntryBranch(err);
			});
		}

	}, function(getExitBranch){

		var exit_branch_type = orderDetails.data.orderData.dataValues.exit_branch_type == 'regional-branch'? 'regional' : 'sub';
		var exit_branch_id = parseInt(orderDetails.data.orderData.dataValues.exit_branch);

		if(!exit_branch_id){
			orderDetails.data.orderData.dataValues["exit_branch_label"] = 'No Entry branch!';
			getExitBranch(null);
		}
		else{

			branchUtils
			.getInclusiveBranchInstance(exit_branch_type , exit_branch_id , null)
			.then(function(branchItem){

				if(branchItem == null){
					orderDetails.data.orderData.dataValues["exit_branch_label"] = 'No Entry branch!';
					getExitBranch(null);
					return Promise.resolve(null);
				}

				if(branchItem.regionalBranch){
					orderDetails.data.orderData.dataValues["exit_branch_label"] = branchItem.label;
					orderDetails.data.orderData.dataValues["exit_regional_branch_label"] = branchItem.regionalBranch.label;
				}else{
					orderDetails.data.orderData.dataValues["exit_branch_label"] = branchItem.label;
					orderDetails.data.orderData.dataValues["exit_regional_branch_label"] = null;
				}

				getExitBranch(null);
			}).catch(function(err){

				orderDetails.data.orderData.dataValues["exit_branch_label"] = 'Error while getting exit branch';
				orderDetails.data.orderData.dataValues["exit_regional_branch_label"] = null;
				if(err){
						console.error(err.stack);
				}
				getExitBranch(err);
			});
	}

	}, function(getClient){

		clientLogic.findNameByMobile(orderDetails.data.orderData.dataValues.sender, function(err, full_name){
			if(err){
				console.error(err.stack);
				getClient("Error while getting client name");
			}
			if(full_name){
				orderDetails.data.orderData.dataValues["sender_name"] = full_name;
			}
			else {
				orderDetails.data.orderData.dataValues["sender_name"] = orderDetails.data.orderData.dataValues.sender;
				//getClient("Error while getting client name");
			}

			orderDetails.statusCode = 200;
			return next(orderDetails);
		});

	}], function(err){
		if(err){
			console.error(err.stack);
			if(!errorData){

				errorData = {
					status: "error",
					statusCode: 500,
					message: err
				};
			}
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
			console.error(err.stack);
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
			console.error(err.stack);
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
					console.error(err.stack);
					next(err);
				}
			});
		}
		else next(null, false);

	}).catch(function(err){
		if(err){
			console.error(err.stack);
			next(err);
		}
	});
}

exports.updateStatus = updateStatus;

var addItem = function(additionalData, operator, next){

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
					if(err){
						console.error(err.stack);
						checkStatus(err);
					}
				});
		}, function(addPayment){

			newPrice = parseFloat(parentOrder.dataValues.payment) + parseFloat(additionalData.total_price);
			addPayment(null);

		}, function(countItem){

			itemLogic.getItemCount(additionalData.uuid, function(err, itemCount){
				if(err){
					 console.error(err.stack);
					 countItem(err);
				}
				else{
					existingItemCount = parseInt(itemCount);
					countItem(null);
				}
			});

		}, function(addItems){

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
				console.error(err.stack);
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

		if(startTimeObject && endTimeObject){

				whereQuery.createdAt = {
					$gte: startTimeObject,
					$lte: endTimeObject
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
			message = "";
			if(err){
				message = err.message;
				console.error(err.stack);
			}
			next({ status:"error" , statusCode:HttpStatus.INTERNAL_SERVER_ERROR , data:null , message: err });
			return;
		});
}

exports.getAnalytics = getAnalytics;

var markDeliverable = function(orderId , user  , next){

		var orderInstance = null;

		sequelize.transaction(function(t){
			return orderModel
			.findOne({
				where: { uuid: orderId },
				transaction: t
			})
			.then(function(orderObject){

				orderInstance = orderObject;

				orderInstance.set("current_hub_type", branchUtils.sanitizeBranchType(orderInstance.get("exit_branch_type")));
				orderInstance.set("current_hub", orderInstance.get("exit_branch"));

				orderInstance.set("next_hub_type", orderInstance.get("current_hub_type"));
				orderInstance.set("next_hub", orderInstance.get("current_hub"));

				orderInstance.set("status", "stocked");

				return orderInstance.save({
					transaction: t
				});
			});
		})
		.then(function(results){
			next({ status: "success" , statusCode: 200 , data: results , message: null });
		})
		.catch(function(err){
			if(err){
				console.error(err.stack);
			}
			next({ status: "error" , statusCode: 500 , data: null , message: err });
		});

}
exports.markDeliverable = markDeliverable;

var markDelivered = function(orderId , user , next){

		var orderInstance = null;

		sequelize.transaction(function(t){

				return orderModel
				.findOne({
					where: { uuid: orderId },
					transaction: t
				})
				.then(function(orderObject){
					orderInstance = orderObject;

					if(orderInstance.payment_status == "paid"){

						orderInstance.set("current_hub_type", branchUtils.sanitizeBranchType(orderInstance.get("exit_branch_type")));
						orderInstance.set("current_hub", orderInstance.get("exit_branch"));

						orderInstance.set("next_hub_type", orderInstance.get("current_hub_type"));
						orderInstance.set("next_hub", orderInstance.get("current_hub"));

						orderInstance.set("status", "delivered");

						return orderInstance.save({
							transaction: t
						});
					}
					else{
						return Promise.reject(new Error("Order can not be delivered without paying the cost first"));
					}
				});
		})
		.then(function(result){

			next({ status: "success" , statusCode: 200 , data: result , message: null });
		})
		.catch(function(err){
			if(err){
				console.error(err.stack);
			}
			next({ status: "error" , statusCode: 500 , data: null , message: err });
		});

};
exports.markDelivered = markDelivered;

var incrementPrintCounter = function(orderId , user , next) {

    var orderInstance = null;

    sequelize.transaction(function (t) {

        return orderModel
            .findOne({
                where: {
									uuid: orderId
								},
                transaction: t,
								lock: t.LOCK.UPDATE
            })
            .then(function (orderObject) {

                orderInstance = orderObject;
                printcountervalue = orderInstance.printcounter + 1;
                orderInstance.set("printcounter", printcountervalue);

                return orderInstance.save({
                    transaction: t
                })
            });
    })
		.then(function (result) {
				next({status: "success", statusCode: 200, count: result.printcounter, message: null});
		})
		.catch(function (err) {
				if (err) {
						console.error(err.stack);
				}
				next({status: "error", statusCode: 500, data: null, message: err});
		});
}

exports.incrementprintcounter=incrementPrintCounter;

var checkTrackingHealth = function(bar_code){

	//Check whether it has tracker id properly or not

	var orderInstance = null;
	var orderTrackerInstance = null;

	return
	orderModel
	.findOne({ where: { bar_code: bar_code } })
	.then(function(oInstance){
		orderInstance = oInstance;
		return orderInstance.getTracker();
	})
	.then(function(trackerInstance){
		if(!trackerInstance){
			return Promise.reject(new Error("tracker instance not attached"));
		}
		orderTrackerInstance = trackerInstance;
	});
};

exports.checkTrackingHealth = checkTrackingHealth;

var checkMoneyOrderHealth = function(bar_code){

	var orderInstance = null;
	var moneyOrderInstance = null;

	return
	orderModel
	.findOne({ where: { bar_code: bar_code } })
	.then(function(oInstance){
		orderInstance = oInstance;
		if(orderInstance.type == "value_delivery"){
			return orderInstance.getMoney_order();
		}
		return Promise.reject(new Error("general order do not have money order associated"));
	});
}

var fixMissingMoneyOrder = function(bar_code){

	return
	orderModel
	.findOne({ where: { bar_code: bar_code } })
	.then(function(oInstance){

	});

};
exports.fixMissingMoneyOrder = fixMissingMoneyOrder;
