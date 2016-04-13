var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var SubBranchModel = sequelize.models.subBranch;
var RegionalBranchModel = sequelize.models.regionalBranch;
var RegionModel = sequelize.models.region;
var async = require('async');

var findOneById = function(id, next){
	if(!id){
		next({"status":"error", "message": "Id required"});
		return;
	}

	SubBranchModel.findOne({where: {id: id}}).then(function(branch){
		if(branch){
			return next({"status": "success", data: branch.dataValues});
		}
		else return next({"status": "error", "message": "No sub-branch by given id"});
	}).catch(function(err){
		if(err){
			console.log(err);
			return next({"status": "error", "message": "Error while finding sub-branch by id"});
		}
	});
};

exports.findOneById = findOneById;

var findByIdList = function(idList, next){

	if(!idList){
		next({"status":"error", "message": "Id required"});
		return;
	}

	SubBranchModel.findAll({
		where: {"id": {"$in": idList}},
		attributes: ['id', 'label', 'position', 'regionalBranchId'] ,
	})
	.map(function(branchItem){

			if(branchItem.regionalBranchId){

				return RegionalBranchModel
				.findOne({ where:{ id: branchItem.regionalBranchId } })
				.then(function(regionalBranchItem){
					branchItem.regionalBranch = regionalBranchItem;
					return branchItem;
				});
			}

			branchItem.regionalBranch = null;
			return branchItem;
	})
	.then(function(branchList){
		console.log(branchList);

		if(branchList){
			return next({"status": "success", data: branchList});
		}
		else return next({"status": "error", "message": "No sub-branchList by given ids"});
	}).catch(function(err){
		if(err){
			console.log(err);
			return next({"status": "error", "message": "Error while finding sub-branchList by ids"});
		}
	});
};

exports.findByIdList = findByIdList;

var findCredential = function(id, next){

	var subBranch, regionalBranch, region;
	if(!id)return next("ID of sub branch required");

	async.series([
		function(findSubBranch){
			SubBranchModel.findOne({where: {id: id}}).then(function(tempSubBranch){
				if(tempSubBranch){
					subBranch = tempSubBranch.dataValues;
					findSubBranch(null);
				}
				else {
					findSubBranch("No sub branch found");
				}

			}).catch(function(err){

				if(err){
					findSubBranch(err);
				}
				else findSubBranch(null);

			});
		},function(findRegionalBranch){

			RegionalBranchModel.findOne({where: {id: subBranch.regionalBranchId}}).then(function(tempRegionalBranch){
				if(tempRegionalBranch){
					regionalBranch = tempRegionalBranch.dataValues;
					findRegionalBranch(null);
				}
				else {
					findRegionalBranch("No regional branch found");
				}

			}).catch(function(err){

				if(err){
					findRegionalBranch(err);
				}
				else findRegionalBranch(null);

			});

		}, function(findRegion){

			RegionModel.findOne({where: {id: regionalBranch.regionId}}).then(function(tempRegion){
				if(tempRegion){
					region = tempRegion.dataValues;

					next(null, {
						"subBranch": subBranch,
						"regionalBranch": regionalBranch,
						"region": region
					});

					findRegion(null);
				}
				else {
					findRegion("No regional branch found");
				}

			}).catch(function(err){

				if(err){
					findRegion(err);
				}
				else findRegion(null);

			});

		}],
		function(err){
			if(err){
				console.log(err);
				next(err);
			}
		}
	);

};

exports.findCredential = findCredential;
