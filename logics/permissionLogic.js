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
					console.error(err.stack);
					return next(err);
				}
			});
		}
	});
};

exports.create = create;


var update = function(data, next){

	if(!data.url){
		next("url required");
	}
	else findByURL(data.url, function(err, permission){
		if(err){
			next(err);
		}
		else if(!permission){

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
					console.error(err.stack);
					next(err);
				}
			});
		}
	});
};

exports.update = update;


var deletedPermission = function(data, next){

	if(!data.url){
		next("url required");
	}
	else findByURL(data.url, function(err, permission){
		if(err){
			console.error(err.stack);
			next(err);
		}
		else if(!permission){

			next("No permission found by this url");
		}
		else{
			//Update existing permission

			permission.destroy().then(function(deletedPermission){
				if(deletedPermission) return next(null, deletedPermission);
				else return next("error while deleting");
			}).catch(function(err){
				if(err){
					console.error(err.stack);
					next(err);
				}
			});
		}
	});
};

exports.deletedPermission = deletedPermission;



var findByURL = function(url, next){

	permissionModel.findOne({where: {url: url}}).then(function(permission){

		if(permission) next(null, permission);
		else next(null, false);

	}).catch(function(err){
		if(err){
			console.error(err.stack);
			next(err);
		}
	});
};

exports.findByURL = findByURL;

var checkPermission = function(url, role, next){
	findByURL(url, function(err, permission){
		if(err){
			console.error(err.stack);
			next(err);
		}
		else if(permission){
			next(null, permission[role]);
		}
		else next(null, true);
		/*here, true is sending because it is assumed that api endpoint
		which is not using permission has global permission to everyone*/
	});
};

exports.checkPermission = checkPermission;

var findAll = function(next){
	permissionModel.findAll().then(function(permissionList){

		if(permissionList) next(null, permissionList);
		else next(null, false);

	}).catch(function(err){
		if(err){
			console.error(err.stack);
			next(err);
		}
	});
}

exports.findAll = findAll;
