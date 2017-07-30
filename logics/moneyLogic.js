var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var moneyModel = sequelize.models.money;
var orderModel = sequelize.models.order;
var regionalBranch = require("./regionalBranchLogic");
var subBranchLogic = require("./subBranchLogic");
var adminLogic = require("./admin/adminLogic");
var orderLogic = require("./orderLogic");
var clientLogic = require("./clientLogic");
var _ = require("lodash");
var async = require("async");
var middleware = require(process.cwd()+ '/middleware');
var branchUtils = require("../utils/branch");
var Promise = require("bluebird");
var adminUtils = require("../utils/admin");
var Promise = require("bluebird");

var create = function(operator, moneyData, next){
	//console.log(moneyData);
	//console.log(operator);

	if(!operator.regional_branch_id || !operator.sub_branch_id){
		next("Missing required operator data");
		return;
	}

	var postData = {
		sender_full_name: moneyData.sender_full_name,
		sender_mobile: moneyData.sender_mobile,
		sender_nid: moneyData.sender_nid || '',
		sender_verification_code: middleware.makeVerficationCode(),
		receiver_full_name: moneyData.receiver_full_name,
		receiver_mobile: moneyData.receiver_mobile,
		receiver_nid: moneyData.receiver_nid || '',
		receiver_verification_code: middleware.makeVerficationCode(),
		amount: parseInt(moneyData.amount),
		charge: parseInt(moneyData.charge),
		discount: parseInt(moneyData.discount) || 0,
		payable: parseInt(moneyData.payable),
		regional_branch_id: parseInt(moneyData.regionalBranch), //destination regional branch
		sub_branch_id: parseInt(moneyData.subBranch) //destination sub branch
	}

	if(moneyData.type == 'virtual_delivery')
	{
		postData["type"] = moneyData["type"];
		postData["money_order_id"] = moneyData["money_order_id"];

		postData["source_regional_branch_id"] = moneyData.source_regional_branch_id;
		postData["source_sub_branch_id"] = moneyData.source_sub_branch_id;

		if(moneyData.payParcelPrice == 'buyer'){
			postData["payable"] = postData["payable"] + moneyData.parcelPrice;
		}
		else {
			postData["amount"] = postData["amount"] - moneyData.parcelPrice;
		}
		postData["payParcelPrice"] = moneyData["payParcelPrice"];
	}
	else {
		postData["source_regional_branch_id"] = operator.regional_branch_id;
		postData["source_sub_branch_id"] = operator.sub_branch_id;

		postData["receiver_operator"] = operator.email;
	}

	if(moneyData.vat == '1.15') postData["vat"] = true;
	else postData["vat"] = false;

	//console.log("Creating moeny order right now!");

	moneyModel
	.create(postData)
	.then(function(moneyParcel){

		if(moneyParcel) next(null, moneyParcel.dataValues);
		else next(null, false);
	})
	.catch(function(err){
		console.error("error while money order creation");
		if(err){
			console.error(err.stack);
		}
		next(err);
	});
};

exports.create = create;

var findAll = function(adminData, next){

	var destinationBranchParams = [], sourceBranchParams = [];

	if(adminData.regional_branch_id) {
		destinationBranchParams.push({regional_branch_id: adminData.regional_branch_id});
		sourceBranchParams.push({source_regional_branch_id: adminData.regional_branch_id});
	}
	if(adminData.sub_branch_id) {
		destinationBranchParams.push({sub_branch_id: adminData.sub_branch_id});
		sourceBranchParams.push({source_sub_branch_id: adminData.sub_branch_id});
	}

	// sourceBranchParams.push({status: {"$in": ['draft', 'received']}});
	// destinationBranchParams.push({status: {"$in": ['deliverable', 'delivered']}});

	var filterParams = {
		"$or":[
			{"$and": destinationBranchParams},
			{"$and": sourceBranchParams}
		]
	};


	moneyModel.findAll({where: filterParams}).then(function(moneyOrderList){
		if(moneyOrderList) next(null, moneyOrderList);
		else next(null, false);
	}).catch(function(err){
		if(err){
			console.error(err.stack);
			next(err);
		}
	});

};
exports.findAll = findAll;

var findBookings = function(params ,next){

	params = params || {};

	var filterParams = {};

	if(params["source_regional_branch_id"]){
		filterParams["source_regional_branch_id"] = params["source_regional_branch_id"];
	}
	if(params["source_sub_branch_id"]){
		filterParams["source_sub_branch_id"] = params["source_sub_branch_id"];
	}
	if(params["status"]){
		filterParams["status"] = params["status"];
	}
	if(params["paid"]){
		filterParams["paid"] = params["paid"];
	}

	// isAllowed = false;
	// if(adminUtils.isPrivileged(adminData["role"])){
	// 		isAllowed = true;
	// }else if(adminData["regional_branch_id"]==params["source_regional_branch_id"] && adminData["sub_branch_id"]==params["source_sub_branch_id"]){
	// 		isAllowed = true;
	// }
	// if(!isAllowed){
	//
	// 	next({ status:"error" , message:"Not allowed to fetch the money orders with spcified paramters and privilege" });
	// 	return;
	// }

	var queryParams = {};
	queryParams["where"] = filterParams;

	if(params.where){
		//queryParams["where"] = JSON.parse(params.where);
	}
	if(params.order){
		//queryParams["order"] = params.order;
	}
	if(params.limit){
			params.limit = parseInt(params.limit);
	}else{
		params.limit = 10;
	}
	queryParams["limit"] = params.limit;

	if(params.page && parseInt(params.page) > 0 && queryParams["limit"]){
			params.page = parseInt(params.page);
	}else{
		params.page = 1;
	}
	queryParams["offset"] = (params.page-1) * queryParams["limit"];
	queryParams["count"] = true;

	moneyModel
		.findAndCountAll(queryParams)
		.then(function(moneyOrderList){
				resultData = {};
				resultData["objects"] = moneyOrderList;
				resultData["pagination"] = {};

				resultData["pagination"]["maxPage"] = Math.ceil(resultData["objects"].count / params.limit);
				if(resultData["pagination"]["maxPage"]==0){
					resultData["pagination"]["maxPage"] = 1;
				}

				if(params.page >= 1 && params.page < resultData["pagination"]["maxPage"] ){
					resultData["pagination"]["nextPageNo"] = params.page + 1;
				}else{
					resultData["pagination"]["nextPageNo"] = null;
				}

				if(params.page > 1 && params.page <= resultData["pagination"]["maxPage"]){
					resultData["pagination"]["previousPageNo"] = params.page -1;
				}else{
					resultData["pagination"]["previousPageNo"] = null;
				}

				resultData["pagination"]["page"] = params.page;
				resultData["pagination"]["limit"] = params.limit;
				next(null, resultData);
		})
		.catch(function(err){
			if(err){
				console.error(err.stack);
				next(err);
				return;
			}
			next({ status:"error" , message:"Error occured" });
	});
}
exports.findBookings = findBookings;

var findById = function(id, next){

	moneyModel.findOne({where: {id: id}}).then(function(moneyOrder){
		if(moneyOrder) {
			subBranchLogic.findCredential(parseInt(moneyOrder.dataValues.sub_branch_id), function(err, detail){
				if(err) {
					console.error(err.stack);
					next(err);
				}
				else{
					if(moneyOrder.dataValues.type == 'virtual_delivery'){
						//find corrensponding order price and send it
						orderModel.findOne({
							where: {uuid: moneyOrder.dataValues.money_order_id},
							attributes: ['payment', 'payment_status']
						})
						.then(function(orderData){

							if(orderData){
								var tempData = moneyOrder.dataValues;
								tempData["subBranch"] = detail.subBranch;
								tempData["regionalBranch"] = detail.regionalBranch;
								if(detail.region) tempData["region"] = detail.region;
								tempData["sender_verification_code"] = null;
								tempData["receiver_verification_code"] = null;

								if(orderData.dataValues.payment_status == 'paid')
									tempData["parcel_payment"] = 0;
								else
									tempData["parcel_payment"] = orderData.dataValues.payment;

									return Promise.resolve(tempData);
							}
							else {
								return Promise.reject("No order found by this id!");
							}
							//else next("No order found by this id!");
						})
						.then(function(tempData){

							source_branch_type = null;
							source_branch_id = null;

							if(moneyOrder.source_sub_branch_id){
								source_branch_type = "sub";
								source_branch_id = moneyOrder.source_sub_branch_id;
							}else{
								source_branch_type = "regional";
								source_branch_id = moneyOrder.source_regional_branch_id;
							}

							//console.log(moneyOrder);

							//console.log(source_branch_type);
							//console.log(source_branch_id);

							return branchUtils
							.getInclusiveBranchInstance(source_branch_type , source_branch_id , null)
							.then(function(sourceBranchInstance){

								branchData = {};
								if(sourceBranchInstance){
									branchData = sourceBranchInstance.dataValues;
									if(sourceBranchInstance.regionalBranch){
										branchData.regionalBranch = sourceBranchInstance.regionalBranch.dataValues;
									}
								}
								tempData["sourceBranch"] = branchData;

								next(null,tempData);
							});
						})
						.catch(function(err){

							if(err){
								console.error(err.stack);
								next(err);
							}
						});
					}
					else{

						var tempData = moneyOrder.dataValues;
						tempData["subBranch"] = detail.subBranch;
						tempData["regionalBranch"] = detail.regionalBranch;
						if(detail.region) tempData["region"] = detail.region;
						tempData["sender_verification_code"] = null;
						tempData["receiver_verification_code"] = null;

						source_branch_type = null;
						source_branch_id = null;

						if(moneyOrder.source_sub_branch_id){
							source_branch_type = "sub";
							source_branch_id = moneyOrder.source_sub_branch_id;
						}else{
							source_branch_type = "regional";
							source_branch_id = moneyOrder.source_regional_branch_id;
						}

						//console.log(moneyOrder);

						//console.log(source_branch_type);
						//console.log(source_branch_id);

						branchUtils
						.getInclusiveBranchInstance(source_branch_type , source_branch_id , null)
						.then(function(sourceBranchInstance){

							//console.log(sourceBranchInstance);

							branchData = {};
							if(sourceBranchInstance){
								branchData = sourceBranchInstance.dataValues;
								if(sourceBranchInstance.regionalBranch){
									branchData.regionalBranch = sourceBranchInstance.regionalBranch.dataValues;
								}
							}
							tempData["sourceBranch"] = branchData;

							next(null,tempData);
						})
						.catch(function(err){
							if(err){
								console.error(err.stack);
								next(err);
								return ;
							}
							next(err);
						});
					}
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

exports.findById = findById;

var findRawById = function(id, next){

	moneyModel.findOne({where: {id: id}}).then(function(moneyOrder){
		if(moneyOrder) {
			next(null, moneyOrder);
		}
		else next(null, false);

	}).catch(function(err){
		if(err){
			console.error(err.stack);
			next(err);
		}
	});

}

exports.findRawById = findRawById;

var receiveOrder = function(id, verification_code, operator, next){
	findRawById(id, function(err, moneyOrder){
		if(err){
			console.error(err.stack);
			next(err);
		}
		else if(!moneyOrder) next("No order found by this error");
		else{
			//Here, verification will be checked

			//if verification passes, receive this order
			if(moneyOrder.dataValues.status == 'draft'){

				moneyOrder.status = 'received';
				moneyOrder.paid = true;
				moneyOrder.payment_time = new Date();
				moneyOrder.payment_receiver_operator = operator.email;

				if(moneyOrder.dataValues.type == 'virtual_delivery')
					orderLogic.receiveVDPayment({id: moneyOrder.dataValues.money_order_id}, operator, function(orderPaymentStatus){
						if(orderPaymentStatus.status == 'success'){
							moneyOrder.save();
							next(null, moneyOrder);
						}
						else if(orderPaymentStatus.status == 'paid'){
							//console.log("It is already paid!!!!!");
							moneyOrder.save();
							next(null, moneyOrder);
						}
						else next("Cannot set order as paid");
					});
				else {
					moneyOrder.save();
					next(null, moneyOrder);
				}

			}
			else{
				//Not in desired state
				next("Cannot set this status bcause of money order logic");
			}
		}
	});
}

exports.receiveOrder = receiveOrder;


var confirmOrder = function(id, operator, next){
	findRawById(id, function(err, moneyOrder){
		if(err) {
			console.error(err.stack);
			next(err);
		}
		else if(!moneyOrder) next("No order found by this error");
		else{
			//Here, verification will be checked
			//console.log(moneyOrder);

			//if verification passes, receive this order
			if(moneyOrder.dataValues.status == 'received'){

				moneyOrder.status = 'deliverable';
				moneyOrder.payment_receiver_operator = operator.email;
				moneyOrder
				.save()
				.then(function(){
						next(null, moneyOrder);
				}).catch(function(exc){
						next(exc);
				});
			}
			else{
				//Not in desired state
				next("Cannot set this status bcause of money order logic");
			}
		}
	});
}

exports.confirmOrder = confirmOrder;

var deliverOrder = function(id, verification_code, operator, next){
	findRawById(id, function(err, moneyOrder){
		if(err){
			console.error(err.stack);
			next(err);
		}
		else if(!moneyOrder) next("No order found by this error");
		else{
			//Here, verification will be checked
			//console.log(moneyOrder);

			//if verification passes, receive this order
			if(moneyOrder.dataValues.status == 'deliverable'){

				moneyOrder.status = 'delivered';
				moneyOrder.delivery_time = new Date();
				moneyOrder.deliver_operator = operator.email;
				moneyOrder.save();
				next(null, moneyOrder);

			}
			else{
				//Not in desired state
				next("Cannot set this status because of money order logic");
			}
		}
	});
}

exports.deliverOrder = deliverOrder;

var deleteMoneyOrder = function(operator, id, next){
	var oldMoneyOrder, receiver_operator, newOrderId;

	async.series([
	function(findOrder){

		findById(id, function(err, moneyOrder){
			if(err){
				console.error(err.stack);
				findOrder(err);
			}
			else if(!moneyOrder) findOrder("No money order found");
			else {
				oldMoneyOrder = moneyOrder;
				findOrder(null);
			}
		});

	}, function(findOperator){

		adminLogic.findAdmin(oldMoneyOrder.receiver_operator, function(err, admin){
			if(err) {
				console.error(err.stack);
				findOperator(err);
			}
			else if(!admin) findOperator("This money order was created by a ghost!");
			else {
				receiver_operator = admin.dataValues;
				findOperator(null);
			}
		});

	}, function(createMoneyOrder){

		var newMoneyOrder = {
			sender_full_name: oldMoneyOrder.receiver_full_name,
			sender_mobile: oldMoneyOrder.receiver_mobile,
			sender_nid: oldMoneyOrder.receiver_nid || '',
			receiver_full_name: oldMoneyOrder.sender_full_name,
			receiver_mobile: oldMoneyOrder.sender_mobile,
			receiver_nid: oldMoneyOrder.sender_nid || '',
			amount: parseInt(oldMoneyOrder.amount) - parseInt(oldMoneyOrder.charge) + parseInt(oldMoneyOrder.discount),
			charge: parseInt(oldMoneyOrder.charge),
			discount: parseInt(oldMoneyOrder.discount) || 0,
			payable: parseInt(oldMoneyOrder.amount),
			receiver_operator: operator.email,
			region: parseInt(receiver_operator.region_id),
			regionalBranch: parseInt(receiver_operator.regional_branch_id),
			subBranch: parseInt(receiver_operator.sub_branch_id),
		}



		create(operator, newMoneyOrder, function(err, moneyOrder){
			if(err) {
				console.error(err.stack);
				createMoneyOrder(err);
			}
			else if(!newMoneyOrder) createMoneyOrder("Could not create money order");
			else {
				//console.log(moneyOrder);
				//console.log("Money order redirected!");
				newOrderId = moneyOrder.id;
				createMoneyOrder(null);
			}
		});

	}, function(confirmNewOrder){

		moneyModel.findOne({where: {id: newOrderId}})
			.then(function(moneyOrder){
				moneyOrder.status = 'deliverable';
				moneyOrder.payment_receiver_operator = operator.email;
				moneyOrder.save();
				confirmNewOrder(null);
			}).catch(function(err){
				if(err){
					console.error(err.stack);
					confirmNewOrder(err);
				}
			});

	}, function(deliverOldOrder){

		moneyModel.findOne({where: {id: oldMoneyOrder.id}})
			.then(function(moneyOrder){
				moneyOrder.status = 'delivered';
				if(!moneyOrder.dataValues.payment_receiver_operator) moneyOrder.payment_receiver_operator = operator.email;
				if(!moneyOrder.dataValues.deliver_operator) moneyOrder.deliver_operator = operator.email;
				moneyOrder.save();
				return next(null, {id: newOrderId});
				deliverOldOrder(null);
			}).catch(function(err){
				if(err){
					console.error(err.stack);
					confirmNewOrder(err);
				}
			});

	}],
	function(err){
		if(err){
			console.error(err.stack);
			next(err);
		}
	});

	//findAdmin

}

exports.deleteMoneyOrder = deleteMoneyOrder;

var destroy = function(moneyId , next){

		moneyModel
		.destroy({ where: { id: moneyId } })
		.then(function(result){

			if(result){
				next({ status: "success" , statusCode: 200 , data:result , message: "successfully deleted" });
			}else{
				console.error(result);
				next({ status:"error" , statusCode: 500 , data: result , message: "Something error happened" });
			}
		})
		.catch(function(err){
				if(err){
						console.error(err.stack);
				}
				next({ status:"error" , statusCode: 500 , data:nul , message:err });
		});
}
exports.destroy = destroy;

var updateVDPrice = function(moneyData, next){

	//console.log(moneyData);

	moneyModel.findOne({
		where: {id: moneyData.id}
	}).then(function(moneyOrderData){

		if(moneyOrderData){

			var updateData = {
				amount: parseInt(moneyData.amount),
				charge: parseInt(moneyData.charge),
				discount: parseInt(moneyData.discount) || 0,
				payable: parseInt(moneyData.payable)
			}

			if(moneyData.newPayParcelPrice == 'buyer'){
				updateData["payable"] = updateData["payable"] + parseInt(moneyData.order_total_price);
			}
			else if(moneyData.newPayParcelPrice == 'seller'){
				updateData["amount"] = updateData["amount"] - parseInt(moneyData.order_total_price);
			}
			updateData["payParcelPrice"] = moneyData.newPayParcelPrice;

			//console.log(updateData);

			moneyOrderData.amount = updateData.amount;
			moneyOrderData.charge = updateData.charge;
			moneyOrderData.discount = updateData.discount;
			moneyOrderData.payable = updateData.payable;

			//console.log(updateData.payParcelPrice);

			if(updateData.payParcelPrice && updateData.payParcelPrice != '')
				moneyOrderData.payParcelPrice = updateData.payParcelPrice;

			moneyOrderData.save().then(function(newMoneyOrderData){
				if(newMoneyOrderData){
					next(null, {id: newMoneyOrderData.dataValues.id});
				}
				else next("Failed to update");
			}).catch(function(err){
				if(err){
					console.error(err.stack);
					next(err);
				}
			});
		}
		else next("No money order found by this id");

	}).catch(function(err){
		if(err){
			console.error(err.stack);
			next(err);
		}
	});

}

exports.updateVDPrice = updateVDPrice;

var getTotalMoneyCount = function(next){

	return moneyModel
	.count()
	.then(function(c){
		if(next){
			next(null , c);
		}
		return Promise.resolve(c);
	})
	.catch(function(err){
		if(err){
			console.error(err.stack);
		}
		next(err);
	});
};
exports.getTotalMoneyCount = getTotalMoneyCount;
