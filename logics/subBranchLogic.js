var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var SubBranchModel = sequelize.models.subBranch;

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

	SubBranchModel.findAll({where: {"id": {"$in": idList}}, attributes: ['id', 'label']}).then(function(branchList){
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
}

exports.findByIdList = findByIdList;
