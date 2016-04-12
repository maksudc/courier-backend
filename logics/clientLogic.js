var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var clientModel	 = sequelize.models.client;

var _ = require('lodash');

function makePass()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function makeVerficationCode()
{
    var text = "";
    var possible = "0123456789";

    for( var i=0; i < 4; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var findOneByMobile = function(mobile, next){

	console.log("*****************Hitting API findOneByMobile**************");

	clientModel.findOne({where: {mobile: mobile}}).catch(function(err){

		if(err){
			return next({"status": "error","data": null, "message": "Cannot get this client, an error occurred"});
			
		}

	}).then(function(client){

		if(client){
			return next({"status": "success","data": client});
		}
		else{
			return next({"status": "error", "message": "No client found by this id", "data": null});
		}

	});
};

exports.findOneByMobile = findOneByMobile;

var create = function(clientData, next){

	clientData["password"] = makePass();
	clientData["verification_code"] = parseInt(makeVerficationCode());

	findOneByMobile(clientData.mobile, function(data){
		if(data.status == "success") return next(data);
		else{
			clientModel.create(clientData).catch(function(err){
				if(err){
					console.log(err);
					return next({"status": "error", "data": null, "message": "Cannot create this client, an error occurred"});
					return;
				}

			}).then(function(client){
				if(client){
					return next({"status": "success","data": client});
				}
				else{
					return next({"status": "error","data": null, "message": "Sorry, cannot create client"});
				}
			});
		}
	});
};

exports.create = create;


var getAll = function(next){

	clientModel.findAll().then(function(clientList){

		if(clientList)next(null, clientList);
		else next(null, false);

	}).catch(function(err){
		if(err){
			console.log(err);
			next(err);
		}
	});
};

exports.getAll = getAll;

var findManyByMobile = function(mobile, next){

	console.log("Adsasdfadsf");

	clientModel.findAll({where: {mobile: {$like: mobile + '%'}}}).then(function(clientList){

		if(clientList) next(null, clientList);
		else next(null, false);

	}).catch(function(err){
		if(err) next(err);
	});

};

exports.findManyByMobile = findManyByMobile;
