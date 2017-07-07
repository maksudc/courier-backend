var express = require('express');
var router = express.Router();

var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');
var HttpStatus = require("http-status-codes");
var DB = require("./../../../models/index");
var clientModel = DB.sequelize.models.client;

var DataTableHelper = require("./../../../utils/data_binder/dataTable");
var Promise = require("bluebird");


router.get("/" , function(req , res){

	tableHelper = new DataTableHelper(req.query);

	userObj = tableHelper.getUser();
  whereQuery = null;

	extraQuery = {

	};

  whereQuery = tableHelper.getWhere(extraQuery);

	queryParams  = {};
	queryParams["limit"] = tableHelper.getLimit();
	queryParams["offset"] = tableHelper.getOffset();
	queryParams["where"] = whereQuery;
	queryParams["order"] = tableHelper.getOrder();

	var resultData = {};
	resultData["draw"] = tableHelper.getDraw();

  clientModel
		.findAndCountAll(queryParams)
		.then(function(clientList){

				resultData["data"] = clientList;
				resultData["recordsTotal"] = clientList.count;
				resultData["recordsFiltered"] = clientList.count;

        res.status(HttpStatus.OK);
        res.send(resultData);
		})
		.catch(function(err){
			if(err){
				console.error(err.stack);
			}
			res.status(HttpStatus.INTERNAL_SERVER_ERROR);
			res.send({ error:"Internal Server error occured" });
	});

});

module.exports = router;
