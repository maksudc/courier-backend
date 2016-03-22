var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var itemModel = sequelize.models.item;
var productModel = sequelize.models.products;

var productLogic = require("../logics/productLogic");
var orderLogic = require("../logics/orderLogic");

var _ = require('lodash');

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
		return !item.amount || !item.product_id || !item.orderUuid;
	});

	if(missingIndex > -1) {
		console.log(data[missingIndex]);
		next({"status": "error", "message": "amount or id is missing at index " + missingIndex.toString() + " of item list"});
		return;
	};


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
