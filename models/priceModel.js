var sequelize = require("./connect");
var Sequelize = require("sequelize");
var products = sequelize.define('products', {
	productName: {type: Sequelize.STRING, primaryKey: true},
	price: {type: Sequelize.FLOAT},
	unit: {type: Sequelize.STRING}
});

products.sync();

module.exports = products;