var sequelize = require("../models/connect");
var Sequelize = require("sequelize");
var productLogic = require("../logics/productLogic");
var itemModel = require("../models/itemModel");

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

var updateOne = function(data, next){

	if(!data.id){
		next({"status": "error", "message": "Required id parameter missing"});
		return;
	}
	else if(!data.product_id && !data.amount){
		next({"status": "error", "message": "Required product_id or amount"});
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