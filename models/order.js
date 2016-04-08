'use strict';
/*var sequelize = require("./connect");
var Sequelize = require("sequelize");
var item = require("./itemModel");
var product = require("./productModel");
var ShipmentModel = require("./shipmentModel");


product.hasOne(item, { foreignKey: 'productUuid' });
order.hasOne(item, { foreignKey: 'orderUuid'});
ShipmentModel.hasMany(order , {foreignKey: 'shipmentUuid'});

product.sync();
order.sync();
item.sync();
module.exports = order;
*/
var _ = require("lodash");

module.exports = function(sequelize, DataTypes) {

	var order = sequelize.define('order', {

		uuid: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV1},
		type: {type: DataTypes.ENUM('general', 'value_delivery'), defaultValue: 'general', allowNull: false},
		confirm_time: {type: DataTypes.DATE},
		receive_time: {type: DataTypes.DATE},
		delivery_time: {type: DataTypes.DATE},
		sender: {type: DataTypes.STRING, allowNull: false}, //sender mobile
		sender_addr: {type: DataTypes.STRING},
		verification_code: {type: DataTypes.INTEGER, defaultValue: Math.floor(Math.random()*10000)},
		nid:{type: DataTypes.STRING},
		receiver: {type: DataTypes.STRING, allowNull: false}, //receiver mobile
		receiver_addr: {type: DataTypes.STRING},
		entry_branch: {type: DataTypes.STRING}, //where the order is received, In 2nd release, branch id
		entry_branch_type: {type: DataTypes.ENUM('regional-branch', 'sub-branch')}, //Entry branch type
		exit_branch: {type: DataTypes.STRING}, //where the order is right now , In 2nd release, branch id
		exit_branch_type: {type: DataTypes.ENUM('regional-branch', 'sub-branch')},
		current_hub: {type: DataTypes.STRING}, //where the product is to be delivered, In 2nd release, branch id
		next_hub: {type: DataTypes.STRING}, //Next destination of this product, In 2nd release, branch id
		receiver_operator: {type: DataTypes.STRING}, //operator who received this product
		payment: {type: DataTypes.FLOAT}, //cost of the order
		payment_status: {type: DataTypes.ENUM('unpaid', 'paid'), defaultValue: 'unpaid'}, //status of payment
		delivery_operator: {type: DataTypes.STRING}, //operator who delivered this product. In 2nd release, operator id
		payment_operator: {type: DataTypes.STRING}, //operator who took the money,In 2nd release, operator id
		status: {
			type: DataTypes.ENUM('draft','confirmed','ready','running','received','reached','forwarded','stocked','delivered','expired'),
			defaultValue: 'draft',
			allowNull: false
		},
		deliveryType: {
			type: DataTypes.ENUM('home', 'branch'),
			defaultValue: 'branch',
			allowNull: false
		},
		packetized :{type: DataTypes.BOOLEAN},	//TO track multiple items not in one packet but under same order
		vd : {type: DataTypes.BOOLEAN},
		vd_id: {type: DataTypes.STRING},
		vd_price: {type: DataTypes.INTEGER},
	} , {

		classMethods: {
			associate: function(models){

				order.hasOne(models.item, { foreignKey: 'orderUuid'});
				order.belongsTo(models.shipment , { foreignKey: 'shipmentUuid' });

				order.hasOne(models.genericTracker , {
					foreignKey: "trackableId",
					constraints: false,
					scope:{
						trackableType: "order"
					},
					as: 'tracker'
				});
			}
		}
	});

	order.hook("afterCreate" , function(order , options){
		/**
			* Create a tracker item corresponding to the order
		**/
		order
		.getTracker()
		.then(function(currentTrackerItem){
			if(!currentTrackerItem){

				var trackerData = {};

				if(order.entry_branch_type == "regional-branch"){
					trackerData.sourceBranchType = "regional";
				}else{
					trackerData.sourceBranchType = "sub";
				}
				trackerData.sourceBranchId = parseInt(order.entry_branch);

				if(order.exit_branch_type == "regional-branch"){
					trackerData.destinationBranchType = "regional";
				}else{
					trackerData.destinationBranchType = "sub";
				}
				trackerData.destinationBranchId = parseInt(order.exit_branch);

				trackerData.currentBranchType = trackerData.sourceBranchType;
				trackerData.currentBranchId = trackerData.sourceBranchId;

				trackerData.previousBranchType = trackerData.sourceBranchType;
				trackerData.previousBranchId = trackerData.sourceBranchId;

				trackerData.trackableType = "order";
				trackerData.trackableId = order.uuid;

				sequelize.models.genericTracker
				.create(trackerData)
				.then(function(trackerItem){
					 console.log("Tracker Attached to the order with uuid: "+ trackerItem.uuid);
				});
			}
		});
	});

	order.hook("beforeDestroy" , function(orderItem , options){

		orderItem
		.getTracker()
		.then(function(trackerItem){
			if(trackerItem){
					return trackerItem.destroy();
			}else{
				return ;
			}
		})
		.then(function(result){
			console.log(result);
		})
		.catch(function(err){
			console.log(err);
		});
	});

	return order;
};
