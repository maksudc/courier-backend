var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var itemModel = sequelize.models.item;
var productModel = sequelize.models.products;
var orderLogic = require("./orderLogic");
var branchRouteLogic = require("./branchRouteLogic");

var _ = require('lodash');
var async= require('async');

var findOneById = function(id, next){

	itemModel.findOne({where: {uuid: id}}).catch(function(err){

		if(err){
			next({"status": "error","data": null, "message": "Cannot get this item, an error occurred"});
			return;
		}

	}).then(function(item){

		if(item){
			next({"status": "success","data": item});
		}
		else{
			next({"status": "error", "message": "No item found by this id", "data": null});
		}

	});
};

exports.findOneById = findOneById;


var findOneByParams = function(params, next){

	itemModel.findOne({where: params}).catch(function(err){

		if(err){
			console.error(err.stack);
			next({"status": "error","data": null, "message": "Cannot get this item, an error occurred"});
			return;
		}

	}).then(function(item){

		if(item){
			next({"status": "success","data": item});
		}
		else{
			next({"status": "error", "message": "No item found by this id", "data": null});
		}

	});
};

exports.findOneByParams = findOneByParams;

var incrementPrintCounter = function (itemId, user, next) {

    var itemInstance = null;

    sequelize.transaction(function (t) {

        return itemModel
            .findOne({
                where: {
                    uuid: itemId
                },
                transaction: t,
                lock: t.LOCK.UPDATE
            })
            .then(function (itemObject) {

                itemInstance = itemObject;
                printcountervalue = itemInstance.printcounter + 1;
                itemInstance.set("printcounter", printcountervalue);

                return itemInstance.save({
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

exports.incrementprintcounter = incrementPrintCounter;


var findManyByIds = function(ids, next){

};

exports.findManyByIds = findManyByIds;

var findByOrderId = function(orderId, next){

	if(!orderId){
		next({"status": "error", "message": "Id required"});
		return;
	}

	itemModel
	.findAll({where: {orderUuid: orderId}})
	.then(function(itemList){
		//if(itemList){

			newItemList = [];
			_.forEach(itemList, function(item){
				newItemList.push(item.dataValues);
			});

			next({"status": "success", "data": newItemList});
		//}
		// else{
		// 	next({"status": "error", "message": "No item found"});
		// }
	})
	.catch(function(err){
		if(err){
			next({"status": "error", "message": "Error while fetching items of order"});
			return;
		}
	});

};

exports.findByOrderId = findByOrderId;

var createOne = function(data, next){

	if(!data.amount || !data.product_id || !data.orderUuid){
		next({"status": "error", "data": null, "message": "Not enough information given"});
		return;
	}

	var data = {
		"amount": parseFloat(data.amount),
		"productUuid": data.product_id,
		"orderUuid": data.orderUuid
	};

	productLogic.calculatePrice(data.productUuid, data.amount, function(priceData){

		if(priceData.status == "error"){
			next({"status": "error", "message": priceData.message});
			return;
		}

		data["price"] = parseFloat(priceData.price);

		itemModel.create(data).catch(function(err){
			if(err){
				console.error(err.stack);
				next({"status": "error", "data": null, "message": "Cannot create this item, an error occurred"});
				return;
			}

		}).then(function(item){
			if(item){
				next({"status": "success","data": item});
			}
			else{
				next({"status": "error","data": null, "message": "Sorry, cannot create item"});
			}
		});

	});
};

exports.createOne = createOne;

var createMany = function(data, next){

	var missingIndex = _.findIndex(data, function(item){

		return !item.amount || !item.product_name || !item.orderUuid;
	});

	if(missingIndex > -1) {
		next({"status": "error", "message": "amount or id is missing at index " + missingIndex.toString() + " of item list"});
		return;
	};

	itemModel.bulkCreate(data , { individualHooks:true })
	.then(function(items){
		if(items){
			var tempItems = [];
			_.forEach(items, function(tempItem){
				tempItems.push(tempItem.dataValues);
			});
			next({"status": "success", data: tempItems});
		}
		else {
			next({"status": "errror", "message": "cannot create these items. Check them properly"});
		}
	})
	.catch(function(err){
		if(err){
			console.error(err.stack);
			next({"status": "error", "message": "error while creating items"});
			return;
		}
	});

};

exports.createMany = createMany;

var create = function(data, next){
	if(!data){
		next({"status": "error", "message": "No data found"});
	}
	else if(Object.prototype.toString.call(data) != '[object Array]'){
		next({"status": "error", "message": "Expecting array of items"});
	}
	else{
		if(data.length < 1){
			next({"status": "error", "message": "Zero items not acceptable"});
		}
		else if(data.length == 1){

			createOne(data[0], function(itemData){
				next(itemData);
			});
		}
		else{
			createMany(data, function(itemData){
				next(itemData);
				return;
			});
		}
	}
};

exports.create = create;

var updateOne = function(data, next){

	if(!data.id){
		next({"status": "error", "message": "Required id parameter missing"});
		return;
	}
	else if(!data.product_id && !data.amount){
		next({"status": "error", "message": "Required product_id and amount"});
		return;
	}

	itemModel.findOne({where: {uuid: data.id}, attributes: ['uuid', 'amount', 'productUuid']}).catch(function(err){

		if(err){
			console.error(err.stack);
			next({"status": "error", "message": "Cannot get this item, an error occurred"});
			return;
		}

	}).then(function(item){
		if(item){

			if(data.amount) item.amount = parseFloat(data.amount);
			if(data.product_id) item.product_id = data.product_id;
			if(data.orderUuid) item.orderUuid = data.orderUuid;

			productLogic.calculatePrice(item.productUuid, item.amount, function(priceData){

				if(priceData.status == "error"){
					next({"status": "error", "message": priceData.message});
					return;
				}

				item.price = parseFloat(priceData.price);
				item.save().catch(function(err){

					if(err){
						console.error(err.stack);
						next({"status": "error", "message": "Cannot get this item, an error occurred"});
						return;
					}

				}).then(function(item){

					next({"status": "success","data": item});
					return;

				});

			});
		}
		else{
			next({"status": "error", "message": "Cannot find the designated itemModel"});
			return;
		}
	});

};

exports.updateOne = updateOne;

var deleteOne = function(data, next){

	if(!data.id){

		next({"status": "error", "message": "id required"});
		return;

	}

	itemModel.findOne({where: {uuid: data.id}, attributes: ['uuid']}).catch(function(err){

		if(err){
			console.error(err.stack);
			next({"status": "error", "message": "Error while deleting this entry"});
			return;
		}

	}).then(function(item){

		if(item){
			item.destroy();
			next({"status": "success", "message": "item deleted"});
			return;
		}
		else{
			next({"status": "error", "message": "Cannot find this item"});
			return;
		}

	});

};

exports.deleteOne = deleteOne;

var deleteByIds = function(ids, next){

};

var deleteByOrderId = function(id, next){

	itemModel.destroy({where: {orderUuid: id}}).catch(function(err){
		if(err){
			console.error(err.stack);
			next({"status": "error", "message": "Error while deleting itemList"});
			return;
		}
	}).then(function(deletedRows){
		next({"status": "success", "message": "items deleted"});
	});

};

exports.deleteByOrderId = deleteByOrderId;

var addItems = function(data, next){

	if(!data.orderUuid){

		next({"status": "error", "message": "order id required"});
		return;

	}

	orderLogic.findOne(data.orderUuid, function(orderData){
		if(orderData.data.dataValues){

			_.forEach(data.item_list, function(item){
				item["orderUuid"] = data.orderUuid;
			});

			create(data.item_list, function(createdItemList){

				if(createdItemList){

					next({"status": "success", data: createdItemList.data});
				}
				else{
					next(createdItemList);
				}
			});
		}
		else{
			next({"status": "error", "message": "No order found by this id"});
		}
	});
};

exports.addItems = addItems;

var updateItemStatus = function(params, next){

	var findParams = {};
	if(params["bar_code"]) findParams["bar_code"] = params["bar_code"];
	if(params["id"]) findParams["uuid"] = params["id"];

	var item, route;

	async.series([function(getItem){

		findOneByParams(findParams, function(data){
			if(data.status == "success") {
				item = data.data;
				getItem(null);
			}
			else getItem("Error finding item by given id");
		});

	}, function(getRoute){

		getRoute(null);

	}, function(setStatus){


		item.status = params["status"];
		item.save().then(function(newItem){

			getRemainingItems(newItem.dataValues.orderUuid, params["status"] , newItem.dataValues.status , function(err, itemCredential){
				if(err){
					console.error(err.stack);
					setStatus(err);
				}
				else {
					next(null, itemCredential);
				}
				setStatus(null);
			});

		}).catch(function(err){
			if(err){
				console.error(err.stack);
				setStatus(err);
			}
		});

	}],
	function(err){

		if(err) {
			console.error(err.stack);
			next(err);
		}

	});
};

exports.updateItemStatus = updateItemStatus;

var setItemRunning  = function(params, next){

	var findParams = {};
	if(params["id"]) findParams["uuid"] = params["id"];
	if(params["bar_code"]) findParams["bar_code"] = params["bar_code"];

	itemModel.findOne({where: findParams}).then(function(item){
		if(item == null){
			console.error("Not found the item.. with params " + JSON.stringify(findParams) );
			return null;
		}

		if(item.dataValues.status == 'received' || item.dataValues.status == 'reached'){
			item.status = 'running';
			item.save().then(function(newItem){
				if(newItem) next(null, newItem);
				else next(null, false);
			}).catch(function(err){
				if(err){
					console.error(err.stack);
					next(err);
				}
			});
		}
	}).catch(function(err){
		if(err) {
			console.error(err.stack);
			next(err);
		}
	});

}

exports.setItemRunning = setItemRunning;

var updateOrderWithBranch = function(id, next){
	itemModel.findAll({where: {orderUuid: id}}).then(function(itemList){

		if(itemList){
			var refItem = itemList[0].dataValues;

			var index = _.findIndex(itemList, function(singleItem){
				return refItem.current_hub != singleItem.dataValues.current_hub || refItem.next_hub != singleItem.dataValues.next_hub;
			});


			if(index < 0){

				orderLogic.findOne(id, function(order){
					order.data.current_hub = refItem.current_hub;
					order.data.next_hub = refItem.next_hub;
					order.data.save().then(function(updatedOrder){
						if(updatedOrder) next(null, updatedOrder);
						else next(null, true);
					}).catch(function(err){
						if(err){
							console.error(err.stack);
							next(null, true);
						}
					});
				});
			}
			else {
				next(null, true);
			}

			//next(null, true);
		}

	}).catch(function(err){
		if(err) {
			console.error(err.stack);
			next(err);
		}
	});
}


var getRemainingItems = function(orderId, updatedStatus , finalItemStatus , next){

	var notUpdatedItemList = null;
	var rootOrder = null;
	var orderUpdated = false;

	orderLogic.findOne(orderId, function(orderData){

		rootOrder = orderData.data;

		if(!rootOrder){

			itemList = [];
			next(null, {
				"remainingItemCount": itemList.length,
				"error": true,
				"errorMessage": "Error while update order. No order found!",
				"orderUpdated": false
			});
			return ;
		}

		itemModel.findAll({
			where:
			{
				orderUuid: orderId,
				status: {
					$not: finalItemStatus
				}
			}
		})
		.then(function(itemList){

				notUpdatedItemList = itemList;

				if(rootOrder.dataValues.status == "running" && rootOrder.dataValues.status != updatedStatus && notUpdatedItemList.length == 0){

					rootOrder.dataValues.status = updatedStatus;
					rootOrder._changed.status = true;

					orderUpdated = true;

					return rootOrder.save();
				}

				return sequelize.Promise.resolve(rootOrder);
			})
			.then(function(savedOrderItem){

				next(null, {
					"remainingItemCount": notUpdatedItemList.length,
					"orderUpdated": orderUpdated,
					"orderData": savedOrderItem.dataValues
				});

			})
			.catch(function(err){
				if(err){
					console.error(err.stack);
					next(err);
				}
			});
	});
};

var getItemCount = function(orderUuid, next){
	itemModel.findAll({
		where: {
			orderUuid: orderUuid
		},
		attributes: ['uuid']
	}).then(function(itemList){

		if(itemList) next(false, itemList.length);
		else next("No order found");

	}).catch(function(err){
		if(err){
			console.error(err.stack);
			next(err);
		}
	});

}

exports.getItemCount = getItemCount;
