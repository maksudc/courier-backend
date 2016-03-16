var regionalBranchModel = require("../models/connect").RegionalBranch;
var Sequelize = require("sequelize");

var findOneById = function(id, next){
	if(!id){
		next({"status":"error", "message": "Id required"});
		return;
	}

	regionalBranchModel.findOne({where: {id: id}}).catch(function(err){
		if(err){
			return next({"status": "error", "message": "Error while finding branch by id"});
		}
	}).then(function(branch){
		if(branch){
			return next({"status": "success", data: branch.dataValues});
		}
		else return next({"status": "error", "message": "No branch by given id"});
	});
};

exports.findOneById = findOneById;