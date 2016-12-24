var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var regionalBranchModel = sequelize.models.regionalBranch;

var findOneById = function(id, next){
	if(!id){
		next({"status":"error", "message": "Id required"});
		return;
	}

	regionalBranchModel.findOne({where: {id: id}}).catch(function(err){
		if(err){
			console.error(err.stack);
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
