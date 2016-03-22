'use strict';
/*var sequelize = require("./connect");
var Sequelize = require("sequelize");



var item = sequelize.define('item', {
	uuid: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV1},
	amount: {type: Sequelize.FLOAT},
	price: {type: Sequelize.FLOAT, allowNull: false},
	product_name: {type: Sequelize.STRING}
});

module.exports = item;*/
module.exports = function(sequelize , DataTypes){

	var item = sequelize.define('item', {
		uuid: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV1},
		amount: {type: DataTypes.FLOAT},
		price: {type: DataTypes.FLOAT, allowNull: false},
		product_name: {type: DataTypes.STRING}
	} , {

		classMethods: {
			associate: function(models){
				item.belongsTo(models.products , { foreignKey: "productUuid" });
				item.belongsTo(models.order , { foreignKey: "orderUuid" });
				item.hasOne(models.genericTracker , { foreignKey: "trackableId" , constraints: false , scope:{ trackableType: "orderItem" } });
			}
		}
	});

	return item;
};
