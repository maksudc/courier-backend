var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var permissionModel = sequelize.models.permission;
var adminModel = sequelize.models.admin;
var _ = require('lodash');

var create = function(data, next){
	var message = "";
	if(!data.url) message = "Missing url";
	else if(!data.description) message="Missing description";

	if(message != "") {
		next(message);
	}
	else findByURL(data.url, function(err, tempPersmission){
		if(err){
			next(err);
		}
		else if(tempPersmission){
			next("Premission exists");
		}
		else{
			permissionModel.create(data).then(function(permission){
				if(permission) {
					next(null, permission);
					return;
				}
			}).catch(function(err){
				if(err)
				{
					console.log(err);
					return next(err);
				}
			});
		}
	});
};

exports.create = create;


var update = function(data, next){

	console.log(data.url);

	if(!data.url){
		next("url required");
	}
	else findByURL(data.url, function(err, permission){
		if(err){
			next(err);
		}
		else if(!permission){
			console.log("No permission found!!!!");
			next("No permission found by this url");
		}
		else{
			//Update existing permission
			if(data.description) permission["description"] = data.description;
			if(data.system_operator) permission["system_operator"] = data.system_operator;
			if(data.accountant) permission["accountant"] = data.accountant;
			if(data.branch_operator) permission["branch_operator"] = data.branch_operator;
			if(data.operator) permission["operator"] = data.operator;

			permission.save().then(function(updatedPermission){
				if(updatedPermission) return next(null, updatedPermission);
				else return next("error while updating");
			}).catch(function(err){
				if(err){
					next(err);
				}
			});
		}
	});
};

exports.update = update;


var deletedPermission = function(data, next){

	console.log(data.url);

	if(!data.url){
		next("url required");
	}
	else findByURL(data.url, function(err, permission){
		if(err){
			next(err);
		}
		else if(!permission){
			console.log("No permission found!!!!");
			next("No permission found by this url");
		}
		else{
			//Update existing permission

			permission.destroy().then(function(deletedPermission){
				if(deletedPermission) return next(null, deletedPermission);
				else return next("error while deleting");
			}).catch(function(err){
				if(err){
					next(err);
				}
			});
		}
	});
};

exports.deletedPermission = deletedPermission;



var findByURL = function(url, next){
	console.log(url);
	permissionModel.findOne({where: {url: url}}).then(function(permission){

		if(permission) next(null, permission);
		else next(null, false);

	}).catch(function(err){
		if(err){

			next(err);

		}
	});
};

exports.findByURL = findByURL;