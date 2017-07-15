var Aggregation = function(operation , column , sequelize_function){
	this.operation = operation;
	this.column = column;
  this.sequelize_function = sequelize_function;
};

Aggregation.prototype.getOperation = function(){
	return this.operation;
};

Aggregation.prototype.getColumn = function(){
	return this.column;
};

Aggregation.prototype.getSequelizeFunction = function() {
  return this.sequelize_function;
};

module.exports = Aggregation;
