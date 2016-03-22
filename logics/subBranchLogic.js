var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var SubBranchModel = sequelize.models.subBranch;

var findOneById = function(id, next){
	if(!id){
		next({"status":"error", "message": "Id required"});
		return;
	}

	SubBranchModel.findOne({where: {id: id}}).catch(function(err){
		if(err){
			return next({"status": "error", "message": "Error while finding sub-branch by id"});
		}
	}).then(function(branch){
		if(branch){
			return next({"status": "success", data: branch.dataValues});
		}
		else return next({"status": "error", "message": "No sub-branch by given id"});
	});
};

exports.findOneById = findOneById;
