var sequelize = require("../models/connect");
var Sequelize = require("sequelize");
var productModel = require("../models/productModel");

var findOneById = function(id, next){

	if(!id){
		next({"status": "error", "message":"id required!", "data": null });
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

var calculatePrice = function(id, amount, next){
	/*id: uuid of product, amount: float
		return: price
	*/
	if(!id || !amount){
		next(false);
		console.log("No id or amount");
		return;
	}

	findOneById(id, function(product){

		var productPrice = parseFloat(product.data.price);
		var threshold_unit = 0;
		var threshold_price = 0;
		
		if(product.threshold_unit){
			threshold_unit = parseFloat(product.threshold_unit);
			threshold_price = parseFloat(product.threshold_price);
		}

		if(amount > threshold_unit){
			next(threshold_price + (amount - threshold_unit)*productPrice);
		}
		else next(threshold_price);

		return;
		
	});
};

exports.calculatePrice = calculatePrice;

var createOne = function(data, next){
	if(!data.product_name || !data.price || !data.unit){
		next({"status": "error", "message": "Not enough information given", "data": null});
		return;
	}

	var productData = {
		"product_name": data.product_name,
		"price": parseFloat(data.price),
		"unit": data.unit //unit is string, i.e: kg, meter, etc
	};

	if((data.threshold_unit && !data.threshold_price) || (!data.threshold_unit && data.threshold_price)){
		next({"status": "error", "message": "Threshold price and unit must be both empty or full"});
		return;
	}
	else if(data.threshold_unit && data.threshold_price) {
		productData["threshold_unit"] = data.threshold_unit;
		productData["threshold_price"] = parseFloat(data.threshold_price);
	}

	productModel.create(productData).catch(function(error){
		
		if(error){
			console.log(error);
			next({ "status": "error", "message": "Error in creating new entry", "data": null});
			return;
		}

	}).then(function(product){
		
		if(product){
			next({"status": "success", "data": data});
		}

	});
};

exports.createOne = createOne;