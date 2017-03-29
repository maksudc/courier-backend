var express = require("express");
var router = express.Router();

var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');
var HttpStatus = require("http-status-codes");
var moneyLogic = require("./../../../logics/moneyLogic");
var DB = require("./../../../models/index");
var moneyModel = DB.sequelize.models.money;

var DataTableHelper = function(tableConfig){
	this.config = tableConfig;
	this.sanitize();
};

DataTableHelper.prototype.sanitize = function(){

	for(I=0; I< this.config.columns.length ; I++){
			this.config.columns[I]["searchable"] = JSON.parse(this.config.columns[I]["searchable"]);
			this.config.columns[I]["orderable"] = JSON.parse(this.config.columns[I]["orderable"]);

			this.config.columns[I]["search"]["regex"] = JSON.parse(this.config.columns[I]["search"]["regex"]);
	}
	this.config.draw = parseInt(this.config.draw);
	this.config.start = parseInt(this.config.start);
	this.config.length = parseInt(this.config.length);

	for(I=0; I < this.config.order.length ; I++){
		this.config.order[I]["column"] = parseInt(this.config.order[I]["column"]);
		this.config.order[I]["dir"] = this.config.order[I]["dir"].toUpperCase();
	}

	this.config.search["regex"] = JSON.parse(this.config.search["regex"]);
};

DataTableHelper.prototype.getLimit = function() {
	return this.config.length;
};

DataTableHelper.prototype.getOffset = function() {
	return this.config.start;
};

DataTableHelper.prototype.getOrder = function(){
	orderStatement = "";
	for(I=0 ; I < this.config.order.length ; I++){
		columnOrderDescriptor = this.config.order[I];
		columnIndex = columnOrderDescriptor["column"];
		sortDir = columnOrderDescriptor["dir"];
		columnObject = this.config.columns[columnIndex];

		if(!columnObject["orderable"]){
			continue;
		}

		if(orderStatement){
			orderStatement = orderStatement + ", ";
		}
		orderStatement = orderStatement + columnObject["data"] + " " + sortDir ;
	}
	return orderStatement;
};

DataTableHelper.prototype.getDraw = function(){
	return this.config.draw;
};

DataTableHelper.prototype.getWhere = function(){
	whereStatement = [];
	for(I=0; I < this.config.columns.length ; I++){
		columnDef = this.config.columns[I];

		if(columnDef.searchable && columnDef["search"]["value"]){

			currentQuery = {};
			operationType = "=";
			if(columnDef["operation"]){
				operationType = columnDef["operation"];
				// Operation wise nexted complex where selection
			}
			if(columnDef["search"]["regex"]){
				operationType = "LIKE";
			}

			if(["=" , "$eq"].indexOf(operationType) > -1){
					currentQuery[columnDef["data"]] = columnDef["search"]["value"];
			}else if(["LIKE"].indexOf(operationType) > -1){
					currentQuery[columnDef["data"]] = {
						"$like": columnDef["search"]["value"]
					};
			}

			whereStatement.push(currentQuery);
		}
	}

	globalSearchQuery = {
		"$or":[]
	};
	if(this.config.search.value){
		operationType = "$eq";
		if(this.config.search.regex){
			operationType = "$like";
		}
		for(I=0 ; I<this.config.columns.length ; I++){
			columnDef = this.config.columns[I];
			if(!columnDef["searchable"]){
				continue;
			}
			columnName = columnDef["data"];
			columnGlobalSearchQuery = {};
			columnGlobalSearchQuery[columnName] = {};
			columnGlobalSearchQuery[columnName][operationType] = this.config.search["value"];
			globalSearchQuery["$or"].push(columnGlobalSearchQuery);
		}
	}

	finalQuery = {};

	combinedQuery = {
		"$and":[]
	};
	combinedQuery["$and"] = whereStatement;

	if(combinedQuery["$and"].length > 0 && globalSearchQuery["$or"].length > 0){
			combinedQuery["$and"].push(globalSearchQuery);
			finalQuery = combinedQuery;
	}else if(combinedQuery["$and"].length > 0){
		  finalQuery = combinedQuery;
	}else{
		finalQuery = globalSearchQuery;
	}

	return finalQuery;
};

router.get('/', function(req, res){

	tableHelper = new DataTableHelper(req.query);
	console.log(tableHelper.config);
	console.log(JSON.stringify(tableHelper.getWhere()));
	console.log(tableHelper.getOrder());
	console.log(tableHelper.getOffset());
	console.log(tableHelper.getLimit());

	queryParams  = {};
	queryParams["limit"] = tableHelper.getLimit();
	queryParams["offset"] = tableHelper.getOffset();
	queryParams["where"] = tableHelper.getWhere();

	var resultData = {};
	resultData["draw"] = tableHelper.getDraw();

	moneyModel
		.findAndCountAll(queryParams)
		.then(function(moneyOrderList){

				resultData["data"] = moneyOrderList;
				resultData["recordsTotal"] = moneyOrderList.count;
				resultData["recordsFiltered"] = moneyOrderList.count;

				res.status(HttpStatus.OK);
				res.send(resultData);
				//resultData["pagination"] = {};
				// resultData["pagination"]["maxPage"] = Math.ceil(resultData["objects"].count / queryParams["limit"]);
				// if(resultData["pagination"]["maxPage"]==0){
				// 	resultData["pagination"]["maxPage"] = 1;
				// }
				//
				// if(params.page >= 1 && params.page < resultData["pagination"]["maxPage"] ){
				// 	resultData["pagination"]["nextPageNo"] = params.page + 1;
				// }else{
				// 	resultData["pagination"]["nextPageNo"] = null;
				// }
				//
				// if(params.page > 1 && params.page <= resultData["pagination"]["maxPage"]){
				// 	resultData["pagination"]["previousPageNo"] = params.page -1;
				// }else{
				// 	resultData["pagination"]["previousPageNo"] = null;
				// }

				// resultData["pagination"]["page"] = params.page;
				// resultData["pagination"]["limit"] = params.limit;
				// next(null, resultData);
		})
		.catch(function(err){
			if(err){
				console.error(err.stack);
			}
			res.status(HttpStatus.INTERNAL_SERVER_ERROR);
			res.send({ error:"Internal Server error occured" });
	});

	// moneyLogic.findBookings(req.query , function(err, data){
	// 	if(err){
	// 		console.error(err.stack);
	// 		res.status(HttpStatus.INTERNAL_SERVER_ERROR);
	// 		res.send({"status": "error", error: err});
	// 		return;
	// 	}
	//
	// 	moneyLogic
	// 	.getTotalMoneyCount(null)
	// 	.then(function(c){
	//
	// 		recordsTotal = data.objects.count;
	// 		recordsFiltered = data.objects.rows.length;
	//
	// 		queryDrawCount = req.query["draw"];
	// 		if(!queryDrawCount){
	// 			queryDrawCount = 1;
	// 		}
	//
	// 		res.status(HttpStatus.OK);
	// 		res.send({
	// 			"status": "success",
	// 			data: data ,
	// 			recordsTotal: recordsTotal ,
	// 			recordsFiltered: recordsFiltered,
	// 			draw: queryDrawCount
	// 		});
	// 	})
	// 	.catch(function(err){
	// 		res.status(HttpStatus.INTERNAL_SERVER_ERROR);
	// 		res.send({"status": "error", error: err});
	// 	});
	// 	// else if(!data) res.send({"status": "error", data: []});
	// });

});


module.exports = router;
