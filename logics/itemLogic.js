var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var itemModel = sequelize.models.item;
var productModel = sequelize.models.products;
var orderLogic = require(process.cwd() + "/logics/orderLogic");
var branchRouteLogic = require(process.cwd() + "/logics/branchRouteLogic");

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

var findManyByIds = function(ids, next){

};

exports.findManyByIds = findManyByIds;

var findByOrderId = function(orderId, next){

	if(!orderId){
		next({"status": "error", "message": "Id required"});
		return;
	}

	itemModel.findAll({where: {orderUuid: orderId}}).catch(function(err){

		if(err){
			next({"status": "error", "message": "Error while fetching items of order"});
			return;
		}

	}).then(function(itemList){
		if(itemList){

			var newItemList = [];
			_.forEach(itemList, function(item){
				newItemList.push(item.dataValues);
			});

			next({"status": "success", "data": newItemList});
		}
		else{
			next({"status": "error", "message": "No item found"});
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
				console.log(err);
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


	//final release: items will be created with predefined price
	var missingIndex = _.findIndex(data, function(item){
		return !item.amount || !item.product_name || !item.orderUuid;
	});

	if(missingIndex > -1) {
		console.log(data[missingIndex]);
		next({"status": "error", "message": "amount or id is missing at index " + missingIndex.toString() + " of item list"});
		return;
	};



	//Product model is not needed
	/*
	productLogic.calculateMultiplePrice(data, function(priceData){
		if(priceData.status != 'success'){
			next(data);
		}
		else{
			console.log(priceData.data);
			itemModel.bulkCreate(priceData.data).catch(function(err){
				if(err){
					next({"status": "error", "message": "error while creating items"});
					return;
				}
			}).then(function(items){
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
			});
		}
	});
	*/

	itemModel.bulkCreate(data , { individualHooks:true }).catch(function(err){
		if(err){
			next({"status": "error", "message": "error while creating items"});
			return;
		}
	}).then(function(items){
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
			console.log("Create one");
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
			next({"status": "error", "message": "Error while deleting this entry"});
			console.log(err);
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
				console.log(createdItemList);
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

var receiveItem = function(id, next){
	var item, route;

	async.series([function(getItem){

		console.log("Get item by id");
		findOneById(id, function(data){
			if(data.status == "success") {
				item = data.data;
				getItem(null);
			}
			else getItem("Error finding item by given id");
		});

	}, function(getRoute){

		console.log("Get route");
		//The following is the ugliest fix of my life. Ashamed of it
		var a, b;
		if(item.dataValues.entry_branch_type == 'regional-branch') a = 'regional';
		else a = 'sub';
		if(item.dataValues.exit_branch_type == 'regional-branch') b = 'regional';
		else b = 'sub';

		branchRouteLogic.getRouteBetween(a, item.dataValues.entry_branch, b, item.dataValues.exit_branch, null).then(function(routes){
			route = routes;
			getRoute(null);
		}).catch(function(err){
			console.log("Error while finding route");
			console.log(err);
			if(err) getRoute(err);
		});

	}, function(setStatus){

		console.log(item.dataValues);

		if(item.dataValues.status == 'running' || item.dataValues.status == "ready"){
			console.log("Route length: " + route.length);

			if(!item.dataValues.current_hub){
				item.current_hub = parseInt(route[0].dataValues.id);
				if(route.length == 1){
					item.status = "reached";
					item.next_hub = parseInt(route[0].dataValues.id);
				}
				else {
					item.status = "received";
					item.next_hub = parseInt(route[1].dataValues.id);
				}
			}
			else{
				item.current_hub = item.dataValues.next_hub;

				var index = _.findIndex(route, function(branch){
					return parseInt(branch.dataValues.id) == parseInt(item.dataValues.next_hub);
				});

				if(index < 0) {
					setStatus("This should not have happended!!! Error in item logic");
					return;
				}
				else if(index < route.length - 1){
					item.status = "received";
					item.current_hub = item.dataValues.next_hub;
					item.next_hub = route[index + 1].dataValues.id;
				}
				else {
					item.status = "reached";
					item.current_hub = item.dataValues.next_hub;
					item.next_hub = item.dataValues.next_hub;
				}
			}

			item.save().then(function(tempItem){

				updateOrderWithBranch(tempItem.dataValues.orderUuid, function(err, order){
					if(err) next(err);
					else next(null, tempItem);

					setStatus(null);
				});
			});
		}
		else{
			setStatus("Cannot rceive item that is not running or ready");
		}

	}],
	function(err){

		if(err) next(err);

	});
};

exports.receiveItem = receiveItem;

var setItemRunning  = function(id, next){

	itemModel.findOne({where: {uuid: id}}).then(function(item){

		if(item.dataValues.status == 'received'){
			item.status = 'running';
			item.save().then(function(newItem){
				if(newItem) next(null, newItem);
				else next(null, false);
			}).catch(function(err){
				if(err){
					console.log(err);
					next(err);
				}
			});
		}

	}).catch(function(err){
		if(err) {
			console.log(err);
			next(err);
		}
	});

}

exports.setItemRunning = setItemRunning;

var updateOrderWithBranch = function(id, next){
	itemModel.findAll({where: {orderUuid: id}}).then(function(itemList){

		if(itemList){
			var refItem = itemList[0].dataValues;

			console.log("***********************************************************");
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
							console.log(err);
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
		if(err) next(err);
	});
}
