var sequelize = require("./connect");
var Sequelize = require("sequelize");
var product = require("./productModel");



var item = sequelize.define('item', {
	uuid: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV1},
	amount: {type: Sequelize.FLOAT},
	price: {type: Sequelize.FLOAT, allowNull: false}
});

product.hasOne(item);

item.sync();

module.exports = item;