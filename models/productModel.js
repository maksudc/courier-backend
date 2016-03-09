var sequelize = require("./connect");
var Sequelize = require("sequelize");
var products = sequelize.define('products', {
	uuid: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV1},
	product_name: {type: Sequelize.STRING, allowNull: false, unique: true},
	unit: {type: Sequelize.STRING, allowNull: false},
	price: {type: Sequelize.FLOAT, allowNull: false},
	threshold_unit: {type: Sequelize.STRING},
	threshold_price: {type: Sequelize.FLOAT}
});

products.sync();

module.exports = products;