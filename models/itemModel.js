var sequelize = require("./connect");
var Sequelize = require("sequelize");



var item = sequelize.define('item', {
	uuid: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV1},
	amount: {type: Sequelize.FLOAT},
	price: {type: Sequelize.FLOAT, allowNull: false}
});

module.exports = item;