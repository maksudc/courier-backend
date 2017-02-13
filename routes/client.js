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

router.get('/getAll', function(req, res){
	clientLogic.getAll(function(err, clientList){
		if(err) res.send({status: "error", message: err});
		else res.send({"status": "success", data: clientList});
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

router.get("/getForExport" , function(req , res){
		// if(!req.params || !req.params.format){
		// 	res.status(400);
		// 	res.send({ status:"error" , message:"format must be sent with parameter" });
		// 	return;
		// }
		//if(req.params.format == "csv"){
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
		// }else{
		// 	res.status(415);
		// 	res.send({ status:"error" , message:"format is not supported" });
		// }
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

			if(clientData.status == "success"){

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

module.exports = router;
