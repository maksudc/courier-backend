var express = require('express');
var router = express.Router();
var config = require('./../config');
var adminLogic = require('./../logics/admin/adminLogic');
var branchLogic = require('./../logics/branchLogic');
var upload = require('multer')();
var async = require('async');

var passport = require('passport');
var middleware = require(process.cwd() + '/middleware');
var HttpStatusCodes = require("http-status-codes");
var referrerLogic = require("./../logics/referrer/referrerLogic");

router.get("/$", passport.authenticate('basic', {session: false}), function(req, res){
	referrerLogic.getAllReferrers()
	.then(function(results){

		response = {
			"meta":{
				"count": results.length,
			},
			"objects":results
		};
		res.status(HttpStatusCodes.OK);
		res.send(response);
	})
	.catch(function(err){
		if(err){
			console.error(err);
		}
		res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
		res.send(err);
	});
});

router.get('/:referrerIdentifier/clients', passport.authenticate('basic', {session: false}), function(req, res){

		referrerLogic.getAllReferredClients(req.params.referrerIdentifier)
		.then(function(result){

			response = {
				"meta":{
					"count": result.length
				},
				"objects": result
			};
			res.status(HttpStatusCodes.OK);
			res.send(response);
		})
		.catch(function(err){
			if(err){
				console.error(err);
			}
			res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
			res.send(err);
		});
});

module.exports = router;
