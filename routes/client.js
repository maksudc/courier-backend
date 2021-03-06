var express = require("express");
var router = express.Router();
var clientLogic = require("../logics/clientLogic");
var multer = require("multer");
var upload = multer();
var passport = require('passport');
var bodyParser = require('body-parser');

var messageUtils = require("../utils/message");
var Promise = require("bluebird");
var phoneUtils = require("../utils/phone");
var json2csv = require("json2csv");
var adminUtils = require("../utils/admin");
var HttpStatus = require("http-status-codes");

router.get('/getAll', function(req, res){
	clientLogic.getAll(function(err, clientList){
		if(err) res.send({status: "error", message: err});
		else res.send({"status": "success", data: clientList});
	});
});

router.post("/create", passport.authenticate('basic', {session: false}), upload.array(), function(req, res){

	clientLogic.createByAdmin(req.body, req.user)
	.then(function(clientInstance){
		res.status(HttpStatus.CREATED);
		res.send(clientInstance.dataValues);
	})
	.catch(function(err){
		if(err){
			console.error(err.stack);
		}
		res.status(HttpStatus.INTERNAL_SERVER_ERROR);
		res.send({ message: err });
	});
});

router.put('/update', upload.array(), function(req, res){
	clientLogic.updateClient(req.body, function(err, client){
		if(err) res.send({status: "error", message: err});
		else res.send({"status": "success", client: client});
	});
});

router.delete('/delete', upload.array(), function(req, res){
	clientLogic.deleteClient(req.body, function(err){
		if(err) res.send({status: "error", message: err});
		else res.send({"status": "success"});
	});
});

router.get('/get/:mobile', function(req, res){
	if(!req.params.mobile) res.send({"status":"error", "message": "Mobile number requried"});
	else{
		var mobile = req.params.mobile;
		clientLogic.findManyByMobile(mobile, function(err, clientList){
			if(err) res.send({status: "error", message: "Error while getting clients"});
			else if(!clientList) res.send({"status": "success", data: null, message: "No matching mobile no"});
			else res.send({"status": "success", data: clientList});
		});
	}
});

router.get("/getAllForExport" , function(req , res){
		if(!req.query || !req.query.format){
			res.status(400);
			res.send({ status:"error" , message:"format must be sent with parameter" });
			return;
		}
		if(req.query.format == "csv"){
	      clientLogic.getAllForExport(function(err , clientList){
					if(err){
						res.status(500);
						res.send({status: "error", message: "Error while getting clients"});
					}
					else if(!clientList){
						res.status(200);
						res.send({"status": "success", data: null, message: "No Clients found"});
					}
					else{
						csvData = json2csv({ data: clientList , fields: clientLogic.exportableFields  , fieldNames: clientLogic.exportableColumnNames} , function(err , fcsv){
								if(err){
									res.status(500);
									res.send({ status:"error" , message:"error while preparing csv exports" });
									return;
								}

								res.setHeader('Content-disposition', 'attachment; filename=clients.csv');
								res.set('Content-Type', 'text/csv');

								res.status(200);
								res.send(fcsv);
						});
					}
				});
		}else{
			res.status(415);
			res.send({ status:"error" , message:"format is not supported" });
		}
});

router.post("/password/resend" , upload.array() , function(req , res){

	var mobile = req.body.mobile;

	stdMobile = phoneUtils.standardizeNumber(mobile);

	if(!stdMobile){

		res.status(400);
		res.send({ status: "error" , message:"mobile number not valid" , data: null });
		return;
	}

	clientLogic.findOneByMobile(mobile, function(clientData){

		if(!clientData) res.send({"status": "success", data: null, message: "No matching mobile no"});
		else{

			if(clientData.status == "success" && clientData.data.has_portal_access){

				messageBody = "Welcome to OMEX COURIER & LOGISTICS LTD. Your password for " + clientData.data.mobile + " is : " + clientData.data.password + " Please log into http://omexcourier.com";
				messageUtils.sendMessage(mobile , messageBody , function(messageResponse){
					console.log(messageResponse);
				});

				res.status(200);
				res.send({ status:"success"  , data: null , message: null });

			}else{
				res.status(500);
				res.send({"status": "success", data: clientData});
			}
		}
	});
});

router.get("/autocomplete_search/",passport.authenticate('basic', {session: false}), function(req, res){

	autocompleteSearchLogic = require("./../logics/client/autocomplete_search");
	autocompleteSearchLogic.search(req)
	.map(function(searchResult){

		formattedResult = {};
		formattedResult["name"] = searchResult.dataValues["mobile"] + "--" + searchResult.dataValues["full_name"];
		formattedResult["value"] = searchResult.dataValues["mobile"];
		formattedResult["text"] = searchResult.dataValues["mobile"];
		formattedResult["disabled"] = false;

		return Promise.resolve(formattedResult);
	})
	.then(function(formattedResults){

		response = {
			"success": true,
			"results": formattedResults
		};

		res.status(HttpStatus.OK);
		res.send(response);
	})
	.catch(function(err){
		if(err){
			console.error(err);
		}
		res.status(500);
		res.send(err);
	});
});

module.exports = router;
