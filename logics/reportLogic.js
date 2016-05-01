var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var moneyModel = sequelize.models.money;
var orderModel = sequelize.models.order;
var async = require('async');
var _ = require('lodash');

var findOrderData = function(params, next){
	orderModel.findAll({where: params, attributes: ['uuid', 'bar_code', 'type', 'payment', 'payment_status']})
		.then(function(orderData){
			next(null, orderData);
		}).catch(function(err){
			if(err){
				console.log(err);
				next(err);
			}
		});
}

var findMoneyData = function(params, next){
	moneyModel.findAll({where: params})
		.then(function(moneyData){

			var moneyList = [];

			_.forEach(moneyData, function(singleMoneyOrder){
				var moneyItem = {
					"id": singleMoneyOrder.dataValues.id,
					"type": singleMoneyOrder.dataValues.type,
					"status": singleMoneyOrder.dataValues.status
				};

				moneyItem["revenue"] = parseInt(
					parseInt(singleMoneyOrder.dataValues.charge) - parseInt(singleMoneyOrder.dataValues.discount));

				moneyList.push(moneyItem);

			});

			next(null, moneyList);
		}).catch(function(err){
			if(err){
				console.log(err);
				next(err);
			}	
		});
}

var getReport = function(next){
	var reportData = {};

	async.series([function(orderReport){

		findOrderData({}, function(err, orderData){
			if(err) orderReport(err);
			else {
				reportData["orderData"]  = orderData;
				orderReport(null);
			}
		});

	}, function(moneyReport){

		findMoneyData({}, function(err, moneyData){
			if(err) moneyReport(err);
			else {
				reportData["moneyData"] = moneyData;
				next(null, reportData);
			}
		});

	}],function(err){
		if(err){
			console.log(err);
			next(err);
		}
	});
}

exports.getReport=getReport;