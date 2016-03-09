var sequelize = require("../models/connect");
var Sequelize = require("sequelize");
var productLogic = require("../logics/productLogic");
var itemModel = require("../models/itemModel");
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

var createOne = function(data, next){
	
	if(!data.amount || !data.product_id){
		next({"status": "error", "data": null, "message": "Not enough information given"});
		return;
	}

	var data = {
		"amount": parseFloat(data.amount),
		"productUuid": data.product_id
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

	var missingIndex = _.findIndex(data, function(item){ 
		return !item.amount || !item.product_id; 
	});

	console.log("missingIndex: " + missingIndex.toString());
	
	if(missingIndex > -1) {
		next({"status": "error", "message": "amount or id is missing at index " + missingIndex.toString() + " of item list"});
		return;
	};

	for(var i=0;i<data.length;i++){
		data[i]["price"] = 20;
	}

	productLogic.calculateMultiplePrice(data, function(priceData){
		next(priceData);
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
			console.log("Create many");
			createMany(data, function(itemData){
				next(itemData);
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