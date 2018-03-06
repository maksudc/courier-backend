var DB = require("./../../../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var moneyModel = sequelize.models.money;
var orderModel = sequelize.models.order;
var regionalBranchModel = sequelize.models.regionalBranch;
var subBranchModel = sequelize.models.subBranch;
var _ = require('lodash');
var moment = require('moment-timezone');
var Promise = require("bluebird");
var branchUtils = require("./../../../utils/branch");

var cashin = function(params, operator, next){
	var searchParams = {};
	var receiverAdminList = [];
	var filteringDateParam = {};
	var timeSearchParams = {};

	var subBranchIdList = [];

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
				{$gte: startDateTime},
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
				{$gte: startDateTime},
				{$lt: endDateTime}
			]
		}

	}
	else {
		//Means today
		// Server is configured with UTC.
		if(filteringDate.getHours() < 6){
			filteringDate.setDate(filteringDate.getDate() - 1);
		}
		filteringDate.setHours(6, 0, 0, 0);

		timeSearchParams = {$gte: filteringDate};
	}

	var whereParams = [
											{payment_status: 'paid'},
											{pay_time: timeSearchParams}
										];
	// Starting the promise chain
	subBranchModel
	.findAll({ where: { "regionalBranchId" : params.regional_branch } })
	.map(function(subBranchInstance){
		return subBranchInstance.id;
	})
	.then(function(subBranchIds){
		if(params.sub_branch){
			subBranchIdList = [];
			subBranchIdList.push(params.sub_branch);
		}else{
			subBranchIdList = subBranchIds;
		}
		return Promise.resolve(subBranchIdList);
	})
	.then(function(subBranchIds){
		if(subBranchIdList.length > 0){
			 whereParams.push({ payment_hub_type: "sub" });
			 whereParams.push({ payment_hub: { "$in": subBranchIdList } });
		}
		if(params.payment_tag){
			whereParams.push({ payment_tag: params.payment_tag });
		}
	})
	.then(function(){

		console.log(whereParams);

		return orderModel.findAll({
			where: {
				"$and": whereParams
			},
			attributes: ['uuid', 'bar_code', 'type', 'payment', 'payment_operator', 'pay_time' , 'payment_hub_type' , 'payment_hub','payment_tag']
		});
	})
	.map(function(orderData){
		return branchUtils
					.getInclusiveBranchInstance(orderData.payment_hub_type , orderData.payment_hub , null)
					.then(function(aBranchData){
							orderData.dataValues.payment_branch = branchUtils.prepareLabel(aBranchData);
							return orderData;
					});
	})
	.then(function(orderDatas){
		next(null, orderDatas);
	})
	.catch(function(err){
		if(err){
			console.error(err.stack);
			next(err);
			return null;
		}
		next("Error in Reporting order Cash In");
	});
};
exports.cashin = cashin;
