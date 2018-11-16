var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var regionModel = sequelize.models.region;
var regionalBranchModel = sequelize.models.regionalBranch;
var subBranchModel = sequelize.models.subBranch;
var _ = require('lodash');

var findAll = function(next){
	var regionList = [], regionalBranchList, subBranchList;

	regionModel.findAll({attributes: ['id', 'name']}).then(function(regions){

		regionalBranchModel.findAll({attributes: ['id', 'label', 'position','address','phone', 'regionId']}).then(function(regionalBranches){

			subBranchModel.findAll({attributes: ['id', 'label', 'position','address','phone', 'regionalBranchId']}).then(function(subBranches){

				regionalBranchList = {};
				_.forEach(subBranches, function(singleSubBranch){
					if(!regionalBranchList[singleSubBranch.dataValues.regionalBranchId])
						regionalBranchList[singleSubBranch.dataValues.regionalBranchId] = [];
					regionalBranchList[singleSubBranch.dataValues.regionalBranchId].push(singleSubBranch.dataValues);

				});

				var tempRegionList = {};
				_.forEach(regionalBranches, function(singleRegionalBranch){
					if(!tempRegionList[singleRegionalBranch.dataValues.regionId])
						tempRegionList[singleRegionalBranch.dataValues.regionId] = [];
					var tempBranch = singleRegionalBranch.dataValues;
					tempBranch["subBranch"] = regionalBranchList[singleRegionalBranch.dataValues.id];
					tempRegionList[singleRegionalBranch.dataValues.regionId].push(tempBranch);
				});

				for(var i=0; i<regions.length; i++){
					var tempRegion = regions[i].dataValues;
					tempRegion["regionalBranch"] = tempRegionList[regions[i].dataValues.id];
					regionList.push(tempRegion);
				}

				next(regionList);
			});
		});
	});
}

exports.findAll = findAll;
