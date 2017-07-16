var User = require("./user");
var Aggregation = require("./aggregation");
var Sequelize = require("sequelize");

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

DataTableHelper.prototype.getUser = function(){
	userObject = null;
	if(this.config.extra && this.config.extra.user){
			userObject = new User(this.config.extra.user.role , this.config.extra.user.sub_branch_id , this.config.extra.user.regional_branch_id);
	}
	return userObject;
};

DataTableHelper.prototype.getExtraFiltering(){
	filterings = [];
}

DataTableHelper.prototype.getAggregations = function(){
	aggregations = [];

	if(this.config.extra){
			aggregation_query = this.config.extra.aggregation;
			aggregation_query.fields = aggregation_query.fields || [];

			for(I=0; I< aggregation_query.fields.length ; I++){
				field_name = aggregation_query.fields[I];
				field_parts = field_name.split("__");

				if(field_parts.length != 2){
					continue;
				}
				column_name = field_parts[0];
				aggregation_function_name = field_parts[1].toLowerCase();
				aggregation_function = [ Sequelize.fn(aggregation_function_name.toUpperCase() , Sequelize.col(column_name)) , field_name ];

				aggregation_obj = new Aggregation( aggregation_function_name , column_name , aggregation_function );
				aggregations.push(aggregation_obj);
			}
	}
	return aggregations;
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

module.exports = DataTableHelper;
