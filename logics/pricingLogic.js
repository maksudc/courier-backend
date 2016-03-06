var sequelize = require("../models/connect");
var Sequelize = require("sequelize");
var productModel = require("../models/priceModel");

var findOneById = function(id, next){
	
	if(!id){
		next({"status": "error", "data": null });
		return;
	}

	productModel.findOne({where: {uuid: id}}).catch(function(err){
		if(err){
			next({"status": "error", "data": null });
			return;
		}
	}).then(function(product){
		if(product){
			next({"status": "success", data: product});
			return;
		}
		else{
			next({"status": "error", "message": "No product found by this id", "data": null});
			return;
		}
	});
};

exports.findOneById = findOneById;

var calculatePrice = function(ids, next){
	/*ids: array of uuid of items*/
	itemModel.find({where: {uuid: ids}}).then(function(items){
		
	});
};

exports.calculatePrice = calculatePrice;