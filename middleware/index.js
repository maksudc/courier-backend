var permissionLogic = require('./../logics/permissionLogic');
var _ = require('lodash');
var Config = require(process.cwd() + '/config');


var checkPermission = function(req, res, next){

	if(req.user.role == Config.adminTypes.super_admin.type) next();
	else permissionLogic.checkPermission(req.baseUrl + req.path, req.user.role, function(err, result){
		console.error(err);
		console.log(result);
		if(err || !result) return res.sendStatus(401);
		else next();
	});
};

exports.checkPermission = checkPermission;


var adminRoutes = function(req, res, next){

	if(req.user.admin) next();
	else res.send(401);
};

exports.adminRoutes = adminRoutes;

var makeVerficationCode = function()
{
    var text = "";
    var possible = "0123456789";

    for( var i=0; i < 4; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

exports.makeVerficationCode = makeVerficationCode;
