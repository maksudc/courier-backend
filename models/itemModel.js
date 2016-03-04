var sequelize = require("./connect");
var Sequelize = require("sequelize");
var product = require("./priceModel");



var item = sequelize.define('item', {
	uuid: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV1},
	amount: {type: Sequelize.FLOAT}
});

product.hasOne(item);

item.sync();

module.exports = item;