'use strict';
/*var sequelize = require("./connect");
var Sequelize = require("sequelize");

module.exports = products;*/
module.exports = function(sequelize , DataTypes){

	var products = sequelize.define('products', {
		uuid: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV1},
		product_name: {type: DataTypes.STRING, allowNull: false}, //In 2nd release, unique: true
		unit: {type: DataTypes.STRING, allowNull: false},
		price: {type: DataTypes.FLOAT, allowNull: false},
		threshold_unit: {type: DataTypes.STRING},
		threshold_price: {type: DataTypes.FLOAT}
	} , {

		classMethods: {
			associate: function(models){

				products.hasOne(models.item , { foreignKey: 'productUuid' });
			}
		}
	});

	return products;
};
