var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var moneyModel = sequelize.models.money;
var regionalBranch = require("./regionalBranchLogic");
var subBranchLogic = require("./subBranchLogic");
var adminLogic = require("./admin/adminLogic");
var clientLogic = require("./clientLogic");
var _ = require("lodash");
var async = require("async");
var middleware = require(process.cwd()+ '/middleware');


var create = function(operator, moneyData, next){
	console.log(moneyData);
	console.log(operator);

	if(!operator.region_id || !operator.regional_branch_id || !operator.sub_branch_id){
		next("Missing required operator data");
		return;
	}

	var postData = {
		sender_full_name: moneyData.sender_full_name,
		sender_mobile: moneyData.sender_mobile,
		sender_nid: moneyData.sender_nid || '',
		sender_verification_code: middleware.makeVerficationCode(),
		receiver_full_name: moneyData.receiver_full_name,
		receiver_mobile: moneyData.receiver_mobile,
		receiver_nid: moneyData.receiver_nid || '',
		receiver_verification_code: middleware.makeVerficationCode(),
		amount: parseInt(moneyData.amount),
		charge: parseInt(moneyData.charge),
		discount: parseInt(moneyData.discount) || 0,
		payable: parseInt(moneyData.payable),
		receiver_operator: operator.email,
		region_id: parseInt(moneyData.region),
		regional_branch_id: parseInt(moneyData.regionalBranch),
		sub_branch_id: parseInt(moneyData.subBranch),
	}

	if(moneyData.vat == '1.15') postData["vat"] = true;
	else postData["vat"] = false;

	moneyModel.create(postData).then(function(moneyParcel){

		if(moneyParcel) next(null, moneyParcel.dataValues);
		else next(null, false);

	}).catch(function(err){

		if(err){
			console.log(err);
			next(err);
		}

	});
};

exports.create = create;

var findAll = function(adminData, next){

	var adminDataParams = {};
	var adminEmailList = [];
	if(adminData.region_id) adminDataParams["region_id"] = adminData.region_id;
	if(adminData.regional_branch_id) adminDataParams["regional_branch_id"] = adminData.regional_branch_id;
	if(adminData.sub_branch_id) adminDataParams["sub_branch_id"] = adminData.sub_branch_id;

	async.series([function(findOperators){

			adminLogic.getSameBranchAdmins(adminDataParams, function(err, adminList){
				if(adminList){
					_.forEach(adminList, function(singleAdmin){
						adminEmailList.push(singleAdmin.dataValues.email);
					});
				}

				findOperators(null);
			});

		}, function(findMoneyOrders){

			var filterParams = {
				"$or":[
					{receiver_operator: {"$in": adminEmailList}},
					{payment_receiver_operator: {"$in": adminEmailList}},
					{deliver_operator: {"$in": adminEmailList}},
					{"$and": [
						{region_id: adminData.region_id},
						{regional_branch_id: adminData.regional_branch_id},
						{sub_branch_id: adminData.sub_branch_id}
					]}
				]
			};


			moneyModel.findAll({where: filterParams}).then(function(moneyOrderList){
				if(moneyOrderList) next(null, moneyOrderList);
				else next(null, false);
			}).catch(function(err){
				if(err){
					console.log(err);
					next(err);
				}
			});

		}], 
		function(err){
			if(err){
				console.log(err);
				next(err);
			}
		});

}

exports.findAll = findAll;

var findById = function(id, next){

	moneyModel.findOne({where: {id: id}}).then(function(moneyOrder){
		if(moneyOrder) {
			subBranchLogic.findCredential(parseInt(moneyOrder.dataValues.sub_branch_id), function(err, detail){
				if(err) next(err);
				else{
					var tempData = moneyOrder.dataValues;
					tempData["subBranch"] = detail.subBranch;
					tempData["regionalBranch"] = detail.regionalBranch;
					tempData["region"] = detail.region;
					tempData["sender_verification_code"] = null;
					tempData["receiver_verification_code"] = null;
					next(null, tempData);
				}
			});
		}
		else next(null, false);

	}).catch(function(err){
		if(err){
			console.log(err);
			next(err);
		}
	});

}

exports.findById = findById;

var findRawById = function(id, next){

	moneyModel.findOne({where: {id: id}}).then(function(moneyOrder){
		if(moneyOrder) {
			next(null, moneyOrder);
		}
		else next(null, false);

	}).catch(function(err){
		if(err){
			console.log(err);
			next(err);
		}
	});

}

exports.findRawById = findRawById;

var receiveOrder = function(id, verification_code, operator, next){
	findRawById(id, function(err, moneyOrder){
		if(err) next(err);
		else if(!moneyOrder) next("No order found by this error");
		else{
			//Here, verification will be checked
			console.log(moneyOrder);

			//if verification passes, receive this order
			if(moneyOrder.dataValues.status == 'draft'){

				moneyOrder.status = 'received';
				moneyOrder.receiver_operator = operator.email;
				moneyOrder.save();
				next(null, moneyOrder);

			}
			else{
				//Not in desired state
				next("Cannot set this status bcause of money order logic");
			}
		}
	});
}

exports.receiveOrder = receiveOrder;


var confirmOrder = function(id, operator, next){
	findRawById(id, function(err, moneyOrder){
		if(err) next(err);
		else if(!moneyOrder) next("No order found by this error");
		else{
			//Here, verification will be checked
			console.log(moneyOrder);

			//if verification passes, receive this order
			if(moneyOrder.dataValues.status == 'received'){

				moneyOrder.status = 'deliverable';
				moneyOrder.payment_receiver_operator = operator.email;
				moneyOrder.save();
				next(null, moneyOrder);

			}
			else{
				//Not in desired state
				next("Cannot set this status bcause of money order logic");
			}
		}
	});
}

exports.confirmOrder = confirmOrder;

var deliverOrder = function(id, verification_code, operator, next){
	findRawById(id, function(err, moneyOrder){
		if(err) next(err);
		else if(!moneyOrder) next("No order found by this error");
		else{
			//Here, verification will be checked
			console.log(moneyOrder);

			//if verification passes, receive this order
			if(moneyOrder.dataValues.status == 'deliverable'){

				moneyOrder.status = 'delivered';
				moneyOrder.deliver_operator = operator.email;
				moneyOrder.save();
				next(null, moneyOrder);

			}
			else{
				//Not in desired state
				next("Cannot set this status bcause of money order logic");
			}
		}
	});
}

exports.deliverOrder = deliverOrder;
