var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var moneyModel = sequelize.models.money;
var orderModel = sequelize.models.order;
var adminLogic = require('./admin/adminLogic');
var branchUtils = require('../utils/branch');
var async = require('async');
var _ = require('lodash');
var moment = require('moment-timezone');

var findOrderData = function(params, next){
	orderModel.findAll({where: params, attributes: ['uuid', 'bar_code', 'type', 'payment', 'payment_status']})
		.then(function(orderData){
			next(null, orderData);
		}).catch(function(err){
			if(err){
				console.error(err.stack);
				next(err);
			}
		});
}

var getOrderPaymentData = function(params, operator, next){

	var searchParams = {};
	var receiverAdminList = [];
	var filteringDateParam = {};
	var timeSearchParams = {};

	var currentDate = moment.tz(new Date(), "Asia/Dhaka");
	var filteringDate = currentDate.toDate();

	if(params.time_range == 'custom_range') {
		var startDateTimeObj = JSON.parse(params.startDate), endDateTimeObj = JSON.parse(params.endDate);

		var startDateTime = moment.tz(startDateTimeObj.year + "-"
			+ (startDateTimeObj.month < 10? "0" : "") + startDateTimeObj.month + "-"
			+ (startDateTimeObj.day < 10? "0" : "") + startDateTimeObj.day + "T"
			+ (startDateTimeObj.hour < 10? "0" : "") + startDateTimeObj.hour + ":"
			+ (startDateTimeObj.minute < 10? "0" : "") + startDateTimeObj.minute + ":00.000", "Asia/Dhaka").toDate();
		var endDateTime = moment.tz(endDateTimeObj.year + "-"
			+ (endDateTimeObj.month < 10? "0" : "") + endDateTimeObj.month + "-"
			+ (endDateTimeObj.day < 10? "0" : "") + endDateTimeObj.day + "T"
			+ (endDateTimeObj.hour < 10? "0" : "") + endDateTimeObj.hour + ":"
			+ (endDateTimeObj.minute < 10? "0" : "") + endDateTimeObj.minute + ":00.000", "Asia/Dhaka").toDate();

		timeSearchParams = {
			"$and": [
				{$gt: startDateTime},
				{$lt: endDateTime}
			]
		}
	}
	else if(params.time_range == "last_day"){

		var startDateTime = currentDate.toDate();
		var endDateTime = currentDate.toDate();

		startDateTime.setDate(startDateTime.getDate() - 1);
		startDateTime.setHours(6, 0, 0, 0);

		endDateTime.setHours(6, 0, 0, 0);

		timeSearchParams = {
			"$and": [
				{$gt: startDateTime},
				{$lt: endDateTime}
			]
		}

	}
	else {
		//Means today
		if(filteringDate.getHours() < 6){
			filteringDate.setDate(filteringDate.getDate() - 1);
		}
		filteringDate.setHours(6, 0, 0, 0);

		timeSearchParams = {$gt: filteringDate};
	}

	async.series([function(findSameBranchAdmin){

		if(params.regional_branch && params.regional_branch != '')
			searchParams["regional_branch_id"] = parseInt(params.regional_branch);
		if(params.sub_branch && params.sub_branch != '')
			searchParams["sub_branch_id"] = parseInt(params.sub_branch);

		if(searchParams["regional_branch_id"] && searchParams["sub_branch_id"] ){
			searchParams = {
				"$and": [
					{"regional_branch_id": parseInt(searchParams["regional_branch_id"])},
					{"sub_branch_id": parseInt(searchParams["sub_branch_id"])}
				]
			}
		}

		adminLogic.getSameBranchAdmins(searchParams, function(err, adminList){
			if(err){
				 console.error(err.stack);
				 next(err);
			}
			else {
				_.forEach(adminList, function(singleAdmin){
					receiverAdminList.push(singleAdmin.dataValues.email);
				});

				findSameBranchAdmin(null);
			}
		});

	}, function(findOrders){

		orderModel.findAll({
			where: {
				"$and": [
					{payment_status: 'paid'},
					{payment_operator: {"$in": receiverAdminList}},
					{pay_time: timeSearchParams}
				]
			},
			attributes: ['uuid', 'bar_code', 'type', 'payment', 'payment_operator', 'pay_time' , 'payment_hub_type' , 'payment_hub','payment_tag']
		}).map(function(orderData){
			return branchUtils
						.getInclusiveBranchInstance(orderData.payment_hub_type , orderData.payment_hub , null)
						.then(function(aBranchData){
								orderData.dataValues.payment_branch = branchUtils.prepareLabel(aBranchData);
								return orderData;
						});
		}).then(function(orderData){
			next(null, orderData);
		}).catch(function(err){
			if(err){
				console.error(err.stack);
				next(err);
			}
		});

	}], function(err){
		if(err){
			console.error(err.stack);
			next(err);
		}
	});
}

exports.getOrderPaymentData = getOrderPaymentData;

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
				console.error(err.stack);
				next(err);
			}
		});
}

var getReport = function(next){
	var reportData = {};

	async.series([function(orderReport){

		findOrderData({}, function(err, orderData){
			if(err){
				orderReport(err);
			}
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
			console.error(err.stack);
			next(err);
		}
	});
}

exports.getReport=getReport;


var findMoneyCashIn = function(params, adminData, next){

	var searchParams = {};
	var filteringDateParam = {};
	var timeSearchParams = {};

	var currentDate = moment.tz(new Date(), "Asia/Dhaka");
	var filteringDate = currentDate.toDate();

	if(params.time_range == 'custom_range') {
		var startDateTimeObj = JSON.parse(params.startDate), endDateTimeObj = JSON.parse(params.endDate);

		var startDateTime = moment.tz(startDateTimeObj.year + "-"
			+ (startDateTimeObj.month < 10? "0" : "") + startDateTimeObj.month + "-"
			+ (startDateTimeObj.day < 10? "0" : "") + startDateTimeObj.day + "T"
			+ (startDateTimeObj.hour < 10? "0" : "") + startDateTimeObj.hour + ":"
			+ (startDateTimeObj.minute < 10? "0" : "") + startDateTimeObj.minute + ":00.000", "Asia/Dhaka").toDate();
		var endDateTime = moment.tz(endDateTimeObj.year + "-"
			+ (endDateTimeObj.month < 10? "0" : "") + endDateTimeObj.month + "-"
			+ (endDateTimeObj.day < 10? "0" : "") + endDateTimeObj.day + "T"
			+ (endDateTimeObj.hour < 10? "0" : "") + endDateTimeObj.hour + ":"
			+ (endDateTimeObj.minute < 10? "0" : "") + endDateTimeObj.minute + ":00.000", "Asia/Dhaka").toDate();

		timeSearchParams = {
			"$and": [
				{$gt: startDateTime},
				{$lt: endDateTime}
			]
		}
	}
	else if(params.time_range == "last_day"){

		var startDateTime = currentDate.toDate();
		var endDateTime = currentDate.toDate();

		startDateTime.setDate(startDateTime.getDate() - 1);
		startDateTime.setHours(6, 0, 0, 0);

		endDateTime.setHours(6, 0, 0, 0);

		timeSearchParams = {
			"$and": [
				{$gt: startDateTime},
				{$lt: endDateTime}
			]
		}

	}
	else {
		//Means today
		if(filteringDate.getHours() < 6){
			filteringDate.setDate(filteringDate.getDate() - 1);
		}
		filteringDate.setHours(6, 0, 0, 0);

		timeSearchParams = {$gt: filteringDate};
	}

	if(params.regional_branch && params.regional_branch != '')
		searchParams["source_regional_branch_id"] = parseInt(params.regional_branch);
	if(params.sub_branch && params.sub_branch != '')
		searchParams["source_sub_branch_id"] = parseInt(params.sub_branch);

	if(searchParams["source_regional_branch_id"] && searchParams["source_sub_branch_id"] ){
		searchParams = {
			"$and": [
				{"source_regional_branch_id": parseInt(searchParams["source_regional_branch_id"])},
				{"source_sub_branch_id": parseInt(searchParams["source_sub_branch_id"])}
			]
		}
	}


	moneyModel.findAll({
		where: {
			"$and": [
				{status: {"$in": ['deliverable', 'delivered']}},
				searchParams,
				{payment_time: timeSearchParams}
			]
		},
		attributes: ['id', 'payable', 'amount', 'charge', 'discount', 'sender_mobile', 'receiver_mobile', 'type', 'payment_time']
	}).then(function(moneyOrderData){
		next(null, moneyOrderData);
	}).catch(function(err){
		if(err){
			console.error(err.stack);
			next(err);
		}
	});

}

exports.findMoneyCashIn = findMoneyCashIn;



var findMoneyCashOut = function(params, adminData, next){

	var searchParams = {};
	var filteringDateParam = {};
	var timeSearchParams = {};

	var currentDate = moment.tz(new Date(), "Asia/Dhaka");
	var filteringDate = currentDate.toDate();

	if(params.time_range == 'custom_range') {
		var startDateTimeObj = JSON.parse(params.startDate), endDateTimeObj = JSON.parse(params.endDate);

		var startDateTime = moment.tz(startDateTimeObj.year + "-"
			+ (startDateTimeObj.month < 10? "0" : "") + startDateTimeObj.month + "-"
			+ (startDateTimeObj.day < 10? "0" : "") + startDateTimeObj.day + "T"
			+ (startDateTimeObj.hour < 10? "0" : "") + startDateTimeObj.hour + ":"
			+ (startDateTimeObj.minute < 10? "0" : "") + startDateTimeObj.minute + ":00.000", "Asia/Dhaka").toDate();
		var endDateTime = moment.tz(endDateTimeObj.year + "-"
			+ (endDateTimeObj.month < 10? "0" : "") + endDateTimeObj.month + "-"
			+ (endDateTimeObj.day < 10? "0" : "") + endDateTimeObj.day + "T"
			+ (endDateTimeObj.hour < 10? "0" : "") + endDateTimeObj.hour + ":"
			+ (endDateTimeObj.minute < 10? "0" : "") + endDateTimeObj.minute + ":00.000", "Asia/Dhaka").toDate();

		timeSearchParams = {
			"$and": [
				{$gt: startDateTime},
				{$lt: endDateTime}
			]
		}
	}
	else if(params.time_range == "last_day"){

		var startDateTime = currentDate.toDate();
		var endDateTime = currentDate.toDate();

		startDateTime.setDate(startDateTime.getDate() - 1);
		startDateTime.setHours(6, 0, 0, 0);

		endDateTime.setHours(6, 0, 0, 0);

		timeSearchParams = {
			"$and": [
				{$gt: startDateTime},
				{$lt: endDateTime}
			]
		}

	}
	else {
		//Means today
		if(filteringDate.getHours() < 6){
			filteringDate.setDate(filteringDate.getDate() - 1);
		}
		filteringDate.setHours(6, 0, 0, 0);

		timeSearchParams = {$gt: filteringDate};
	}

	if(params.regional_branch && params.regional_branch != '')
		searchParams["regional_branch_id"] = parseInt(params.regional_branch);
	if(params.sub_branch && params.sub_branch != '')
		searchParams["sub_branch_id"] = parseInt(params.sub_branch);

	if(searchParams["regional_branch_id"] && searchParams["sub_branch_id"] ){
		searchParams = {
			"$and": [
				{"regional_branch_id": parseInt(searchParams["regional_branch_id"])},
				{"sub_branch_id": parseInt(searchParams["sub_branch_id"])}
			]
		}
	}

	console.log("search params: " + searchParams);


	moneyModel.findAll({
		where: {
			"$and": [
				{status: 'delivered'},
				searchParams,
				{delivery_time: timeSearchParams}
			]
		},
		attributes: ['id', 'amount', 'charge', 'discount', 'payable', 'sender_mobile', 'receiver_mobile', 'type', 'delivery_time']
	}).then(function(moneyOrderData){
		next(null, moneyOrderData);
	}).catch(function(err){
		if(err){
			console.error(err.stack);
			next(err);
		}
	});

}

exports.findMoneyCashOut = findMoneyCashOut;
