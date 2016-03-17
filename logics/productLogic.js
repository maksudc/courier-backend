var sequelize = require("../models/connect");
var Sequelize = require("sequelize");
var productModel = require("../models/productModel");
var _ = require('lodash');

var findOneById = function(id, next){

	if(!id){
		next({"status": "error", "message":"id required!", "data": null });
		return;
	}

	productModel.findOne({where: {uuid: id}}).catch(function(err){
		if(err){
			next({"status": "error", "message": "Unknown error", "data": null });
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

var findManyById = function(ids, next){

	if(Object.prototype.toString.call(ids) != '[object Array]'){
		next({"status": "error", "message":"id required!", "data": null });
		return;
	}

	productModel.findAll({where: {uuid: ids}}).catch(function(err){
		if(err){
			next({"status": "error", "message": "Unknown error", "data": null });
			return;
		}
	}).then(function(products){
		if(products){
			next({"status": "success", data: products});
			return;
		}
		else{
			next({"status": "error", "message": "No product found by this id", "data": null});
			return;
		}
	});
};

exports.findManyById = findManyById;

var calculatePrice = function(id, amount, next){
	/*id: uuid of product, amount: float
		return: price
	*/
	if(!id || !amount){
		next({"status": "error", "message": "Not enough information given"});
		return;
	}

	findOneById(id, function(product){

		if(product.data){
			var productPrice = parseFloat(product.data.price);
			var threshold_unit = 0;
			var threshold_price = 0;
			
			if(product.threshold_unit){
				threshold_unit = parseFloat(product.threshold_unit);
				threshold_price = parseFloat(product.threshold_price);
			}

			if(amount > threshold_unit){
				next({"status": "success", "price" :threshold_price + (amount - threshold_unit)*productPrice});
			}
			else next({"status": "success", "price" :threshold_price});

			return;
		}
		else next({"status": "error", "message": "No product found by this product id"});
		
	});
};

exports.calculatePrice = calculatePrice;

var calculateMultiplePrice = function(data, next){
	//must create array of ids
	console.log("This is called!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
	var ids = [];
	_.forEach(data, function(item){
		if(ids.indexOf(item.product_id) < 0)
			ids.push(item.product_id);
	});

	findManyById(ids, function(products){

		var pricingData = {};
		if(products.data){
			
			_.forEach(products.data, function(product){
				if(!pricingData[product.dataValues.uuid]){
					// pricingData[product.dataValues.uuid] = {
					// 	"price": parseFloat(product.dataValues.price),
					// 	"threshold_unit": parseInt(product.dataValues.threshold_unit),
					// 	"threshold_price": parseFloat(product.dataValues.threshold_price)
					// }

					pricingData[product.dataValues.uuid] = product.dataValues;
				}
			});

			var newPrices = [];

			_.forEach(data, function(item){
				var singleForm = false;
				var amount;
				if(item["single"]){
					singleForm = true;
					amount = parseInt(item["amount"]);
					item["amount"] = 1;
				}

				if(!pricingData[item.product_id]["threshold_unit"]){
					item["price"] = pricingData[item.product_id]["price"]*item["amount"];
				}
				else{
					if(item.amount > pricingData[item.product_id]["threshold_unit"]){
						item["price"] = pricingData[item.product_id]["threshold_price"] + 
							(item.amount - pricingData[item.product_id]["threshold_unit"]) * 
								pricingData[item.product_id]["price"];
					}
					else item["price"] = pricingData[item.product_id]["threshold_price"];
				}

				item["product_name"] = pricingData[item.product_id]["product_name"];
				item["productUuid"] = item["product_id"];
				delete item["product_id"];
				
				if(!singleForm){
					newPrices.push(item);
				}
				else{
					for(var i=0; i<amount; i++){
						newPrices.push(item);
					}
				}

			});

			next({"status": "success", data: newPrices});
			return;
		}
		else next({"status": "error", "message": "No product found by these product ids"});
		
	});
};

exports.calculateMultiplePrice = calculateMultiplePrice;

var createOne = function(data, next){
	//error checking
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



var createMany = function(data, next){

	var productData = [];

	var errorIndex = _.findIndex(data, function(singleProduct){
		if(!singleProduct.product_name || !singleProduct.price || !singleProduct.unit){
			next({"status": "error", "message": "Not enough information given for products", "data": null});
			return true;
		}
		else{
			console.log(singleProduct);
			var tempData = {
				"product_name": singleProduct.product_name,
				"unit": singleProduct.unit //unit is string, i.e: kg, meter, etc
			};

			if(singleProduct["unitPrice"]) tempData["price"] = parseFloat(singleProduct["unitPrice"]);
			else tempData["price"] = parseFloat(singleProduct.price);

			if((singleProduct.threshold_unit && !singleProduct.threshold_price) || (!singleProduct.threshold_unit && singleProduct.threshold_price)){
				next({"status": "error", "message": "Threshold price and unit must be both empty or full"});
				return;
			}
			else if(singleProduct.threshold_unit && singleProduct.threshold_price) {
				tempData["threshold_unit"] = singleProduct.threshold_unit;
				tempData["threshold_price"] = parseFloat(singleProduct.threshold_price);
			}

			productData.push(tempData);
		}
	});

	if(errorIndex > -1) return;

	productModel.bulkCreate(productData).catch(function(error){
		
		if(error){
			next({ "status": "error", "message": "Error in creating new entry", "data": null});
			return;
		}

	}).then(function(productList){
		
		if(productList){
			var tempProductList = [];
			_.forEach(productList, function(tempProduct){tempProductList.push(tempProduct.dataValues);});
			next({"status": "success", "data": tempProductList});
		}
		else{
			next({"status": "error", "message": "Cannot create multiple products"});
		}

	});
};

exports.createMany = createMany;




var updateOne = function(data, next){

	if(!data.id){
		next({"status": "error", "message": "No id given", "data": null});
		return;
	}

	productModel.findOne({where: {uuid: data.id}}).catch(function(err){
		if(err)
			next({"status": "error", "message": "Cannot update this entry", "data": null});
		else 
			next({"status": "error", "message": "Cannot update this entry, unknown error", "data": null});

		return;

	}).then(function(product){
		
		if(product){
			if(data.product_name) product.product_name = data.product_name;
			if(data.price) product.price = parseFloat(data.price);
			if(data.unit) product.unit = data.unit;
			
			if(data.threshold_unit){
				if(product.threshold_price || data.threshold_price)
					product.threshold_unit = data.threshold_unit;
				else {
					next({
						"status": "error",
						"message": "Threshold price and unit must be present at the same time",
						"data": null
					});
					return;
				}
			}

			if(data.threshold_price){
				if(product.threshold_unit || data.threshold_unit)
					product.threshold_price = parseFloat(data.threshold_price);
				else{
					next({
						"status": "error",
						"message": "Threshold price and unit must be present at the same time",
						"data": null
					});
					return;
				}
			}

			product.save().catch(function(err){
				
				if(err){
					next({"status": "error", "message": "Error while updating", "data": null});
					return;
				}

			}).then(function(new_product){
				if(new_product){
					next({"status": "success", "data": new_product});
					return;
				}
			});
		}
		else{
			next({"status": "error", "message": "Cannot find this product", "data": null});
		}
	});

};

exports.updateOne = updateOne;

var deleteOne = function(data, next){

	if(!data.id){
		next({"status": "error", "message": "No id defined", "data": null});
		return;
	}

	productModel.findOne({where: {uuid: data.id}}).catch(function(err){
		
		if(err){
			next({"status": "error", "message": "Error while deleting this entry", "data": null});
			return;
		}

	}).then(function(product){
		
		if(product){
			
			product.destroy();
			next({"status": "success", "data": null, "message": "Product deleted"});
			return;

		}
		else{
			
			next({"status": "error","data": null, "message": "Cannot find this product"});
			return;

		}
	});
};

exports.deleteOne = deleteOne;