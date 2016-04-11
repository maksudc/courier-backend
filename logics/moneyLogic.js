var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var moneyModel = sequelize.models.money;
var regionalBranch = require("./regionalBranchLogic");
var subBranchLogic = require("./subBranchLogic");
var clientLogic = require("../logics/clientLogic");
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

var findAll = function(next){

	moneyModel.findAll().then(function(moneyOrderList){
		if(moneyOrderList) next(null, moneyOrderList);
		else next(null, false);
	}).catch(function(err){
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