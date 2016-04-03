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
		product_name: {type: DataTypes.STRING},
		length: {type: DataTypes.INTEGER},
		width: {type: DataTypes.INTEGER},
		height: {type: DataTypes.INTEGER},
		weight: {type: DataTypes.FLOAT},
		entry_branch: {type: DataTypes.INTEGER}, //where the order is received, In 2nd release, branch id
		entry_branch_type: {type: DataTypes.ENUM('regional-branch', 'sub-branch')}, //Entry branch type
		exit_branch: {type: DataTypes.INTEGER}, //where the order is right now , In 2nd release, branch id
		exit_branch_type: {type: DataTypes.ENUM('regional-branch', 'sub-branch')},
		current_hub: {type: DataTypes.STRING}, //where the product is to be delivered, In 2nd release, branch id
		next_hub: {type: DataTypes.STRING} //Next destination of this product, In 2nd release, branch id

	} , {

		classMethods: {
			associate: function(models){

				item.belongsTo(models.order , { foreignKey: "orderUuid" });
				item.hasOne(models.genericTracker , { foreignKey: "trackableId" , constraints: false , scope:{ trackableType: "orderItem" } });
			
			}
		}
		
	});

	return item;
};
