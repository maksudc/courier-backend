var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var clientModel	 = sequelize.models.client;

var fs = require("fs");
var handlebars = require("handlebars");

var messageUtils = require("../utils/message");
var commonUtils = require("../utils/common");

var _ = require('lodash');
var Promise = require("bluebird");

var exportableFields = ['mobile' , 'full_name' , 'address' , 'national_id' ];
var exportableColumnNames = ["Phone" , "Name" , "Address" , "National Id"];
exports.exportableFields = exportableFields;
exports.exportableColumnNames = exportableColumnNames;

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

	clientModel.findOne({where: {mobile: mobile}}).then(function(client){

		if(client){
			return next({"status": "success","data": client});
		}
		else{
			return next({"status": "error", "message": "No client found by this id", "data": null});
		}

	}).catch(function(err){
		if(err){
      console.error(err.stack);
    }
    return next({"status": "error","data": null, "message": "Cannot get this client, an error occurred" , "err": err});
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
      console.error(err.stack);
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
          console.error("Cannot create client");
					return next({"status": "error","data": null, "message": "Sorry, cannot create client"});
				}
			})
      .catch(function(err){
				if(err){
					console.error(err.stack);
					return next({"status": "error", "data": null, "message": "Cannot create this client, an error occurred"});
				}
			});
		}
	});
};

exports.create = create;

var createByAdmin = function(clientData){

  clientData["password"] = makePass();
  clientData["verification_code"] = parseInt(makeVerficationCode());

  return sequelize.transaction(function(t){
    return clientModel
    .create(clientData, { transaction: t });
  });
}
exports.createByAdmin = createByAdmin;


var getAll = function(next){

	clientModel.findAll().then(function(clientList){

		if(clientList)next(null, clientList);
		else next(null, false);

	}).catch(function(err){
		if(err){
			console.error(err.stack);
			next(err);
		}
	});
};

exports.getAll = getAll;

var getAllForExport = function(next){

  clientModel
  .findAll({
    attributes: exportableFields
  })
  .then(function(clientList){
      next(null , clientList);
  })
  .catch(function(err){
      if(err){
        console.error(err.stack);
        next(err);
      }else{
        next({ status:"error",message:"api error while exporting clients" });
      }
  });
}
exports.getAllForExport = getAllForExport;

var findManyByMobile = function(mobile, next){

	clientModel.findAll({where: {mobile: {$like: mobile + '%'}}}).then(function(clientList){

		if(clientList) next(null, clientList);
		else next(null, false);

	}).catch(function(err){
		if(err){
      console.error(err.stack);
      next(err);
    }
	});

};

exports.findManyByMobile = findManyByMobile;

var updateClient = function(params, next){

  updateData = {
		mobile: params.new_mobile_no,
		national_id: params.nid,
		address: params.address,
		full_name: params.full_name,
    has_portal_access: params.has_portal_access
	};

  if(params.referrer_type){
    updateData["referrer_type"] = params.referrer_type;
  }

  if(commonUtils.isNull(params.referrer_identifier)){
    updateData["referrer_identifier"] = null;
  }else{
    updateData["referrer_identifier"] = params.referrer_identifier;
  }

	clientModel.update(updateData, {where: {mobile: params.mobile}}).then(function(updatedClient){
		params["mobile"] = params["new_mobile_no"];
		if(params["new_mobile_no"]) delete params["new_mobile_no"];
		next(null, params);
	}).catch(function(err){
		if(err){
			console.error(err.stack);
			next(err);
		}
	});
};

exports.updateClient = updateClient;

var deleteClient = function(params, next){

	clientModel.findOne({where: {mobile: params.mobile}}).then(function(client){

		client.destroy();
		next(null);

	}).catch(function(err){
		if(err){
      console.error(err.stack);
			return next({"status": "error","data": null, "message": "Cannot get this client, an error occurred" , "err": err});
		}
	});
};

exports.deleteClient = deleteClient;

var checkLogin = function(mobile, password, next){
    clientModel.findOne({
        where: {mobile: mobile, password: password}}
    ).then(function(client){
        if(client){
            next(null, client.dataValues);
        }
        else{
            next(null, false);
        }
    }).catch(function(err){
        if(err){
        	console.error(err);
            next("Error while reading client");
        }
    });
}

exports.checkLogin = checkLogin;


var findClient = function(mobile, next){

    clientModel.findOne({
        where: {mobile: mobile}}
    ).then(function(client){
        if(client){
            next(null, client.dataValues);
        }
        else{
            next("No client found");
        }
    }).catch(function(err){
        if(err){
        	console.error(err);
            next("Error while reading client");
        }
    });

exports.findClient = findClient;

};
