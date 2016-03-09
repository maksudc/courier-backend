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

	productLogic.calculatePrice(data.productUuid, data.amount, function(price){

		if(!price){
			next({"status": "error", "data": null, "message": "Cannot calculate price"});
			return;
		}

		data["price"] = parseFloat(price);

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