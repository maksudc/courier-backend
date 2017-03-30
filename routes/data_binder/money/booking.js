var express = require("express");
var router = express.Router();

var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');
var HttpStatus = require("http-status-codes");
var adminUtils = require("./../../../utils/admin");
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

var User = function(role , subBranchId , regionalBranchId){
	this.role = role;
	this.subBranchId = subBranchId;
	this.regionalBranchId = regionalBranchId;
};

User.prototype.getRole = function(){
	return this.role;
};

User.prototype.getSubBranchId = function(){
	return this.subBranchId;
};

User.prototype.getRegionalBranchId = function(){
	return this.regionalBranchId;
};


DataTableHelper.prototype.getUser = function(){
	userObject = null;
	if(this.config.extra && this.config.extra.user){
			userObject = new User(this.config.extra.user.role , this.config.extra.user.sub_branch_id , this.config.extra.user.regional_branch_id);
	}
	return userObject;
};

DataTableHelper.prototype.getDraw = function(){
	return this.config.draw;
};

DataTableHelper.prototype.getWhere = function(queryWrapper){
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
						"$like": columnDef["search"]["value"] + "%"
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
			columnGlobalSearchQuery[columnName][operationType] = this.config.search["value"] + "%";
			globalSearchQuery["$or"].push(columnGlobalSearchQuery);
		}
	}

	finalQuery = null;

	combinedQuery = {
		"$and":[]
	};
	combinedQuery["$and"] = whereStatement;

	if(combinedQuery["$and"].length > 0 && globalSearchQuery["$or"].length > 0){
			combinedQuery["$and"].push(globalSearchQuery);
			finalQuery = combinedQuery;
	}else if(combinedQuery["$and"].length > 0){
		  finalQuery = combinedQuery;
	}else if(globalSearchQuery["$or"].length > 0){
			finalQuery = globalSearchQuery;
	}
	else{
		finalQuery = {};
	}

	if(queryWrapper){
		tempQuery = {
			"$and":[]
		};
		tempQuery["$and"].push(finalQuery);
		tempQuery["$and"].push(queryWrapper);
		finalQuery = tempQuery;
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

	userObj = tableHelper.getUser();

	console.log(userObj);
	whereQuery = null;

	if(userObj){
		//&& !adminUtils.isPrivileged(userObj.getRole())){
		extraQuery = {};
		if(userObj.getSubBranchId()){
			extraQuery["source_sub_branch_id"] = userObj.getSubBranchId();
		}
		if(userObj.getRegionalBranchId()){
			extraQuery["source_regional_branch_id"] = userObj.getRegionalBranchId();
		}
		whereQuery = tableHelper.getWhere(extraQuery);
	}else{
		whereQuery = tableHelper.getWhere();
	}
	queryParams  = {};
	queryParams["limit"] = tableHelper.getLimit();
	queryParams["offset"] = tableHelper.getOffset();
	queryParams["where"] = whereQuery;
	queryParams["order"] = tableHelper.getOrder();

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
