var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var clientModel	 = sequelize.models.client;

var fs = require("fs");
var handlebars = require("handlebars");

var messageUtils = require("../utils/message");


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

	//console.log("*****************Hitting API findOneByMobile**************");

	clientModel.findOne({where: {mobile: mobile}}).then(function(client){

		if(client){
			return next({"status": "success","data": client});
		}
		else{
			return next({"status": "error", "message": "No client found by this id", "data": null});
		}

	}).catch(function(err){

    console.error(err);

		if(err){
			return next({"status": "error","data": null, "message": "Cannot get this client, an error occurred" , "err": err});
		}
	});
};

exports.findOneByMobile = findOneByMobile;


var findNameByMobile = function(mobile, next){

	clientModel.findOne({where: {mobile: mobile}}).then(function(client){

		if(client){
			return next(null, client.dataValues.full_name);
		}
		else{
			return next("No client found!");
		}

	}).catch(function(err){

		if(err){
			return next(err);
		}

	});
};

exports.findNameByMobile = findNameByMobile;

var create = function(clientData, next){

	clientData["password"] = makePass();
	clientData["verification_code"] = parseInt(makeVerficationCode());

	findOneByMobile(clientData.mobile, function(data){
		if(data.status == "success"){
      data.isNew = false;
      return next(data);
    }else{

      clientModel
      .create(clientData)
      .then(function(client){
				if(client){
          return next({"status": "success","data": client , "isNew": true});
					//return next({"status": "success","data": client});
				}
				else{
					return next({"status": "error","data": null, "message": "Sorry, cannot create client"});
				}
			})
      .catch(function(err){
				if(err){
					console.error(err);
					return next({"status": "error", "data": null, "message": "Cannot create this client, an error occurred"});
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
			console.error(err);
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

var updateClient = function(params, next){

	console.log(params);
	clientModel.update({
		mobile: params.new_mobile_no,
		national_id: params.nid,
		address: params.address,
		full_name: params.full_name
	}, {where: {mobile: params.mobile}}).then(function(updatedClient){
		console.log(updatedClient);
		params["mobile"] = params["new_mobile_no"];
		if(params["new_mobile_no"]) delete params["new_mobile_no"];
		next(null, params);
	}).catch(function(err){
		if(err){
			console.log(err);
			next(err);
		}
	});
};

exports.updateClient = updateClient;


var deleteClient = function(params, next){

	console.log(params);
	clientModel.findOne({where: {mobile: params.mobile}}).then(function(client){
		console.log(client);
		client.destroy();
		next(null);

	}).catch(function(err){

    	console.error(err);

		if(err){
			return next({"status": "error","data": null, "message": "Cannot get this client, an error occurred" , "err": err});
		}
	});
};

exports.deleteClient = deleteClient;
