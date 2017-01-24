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
var Promise = require("bluebird");
var moduleSettings = require("../config/moduleSettings");

module.exports = function(sequelize , DataTypes){

	var item = sequelize.define('item', {
		uuid: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV1},
		bar_code: {type: DataTypes.STRING, unique: true},

		amount: {type: DataTypes.FLOAT},
		unit: {type: DataTypes.STRING}, //migration for this field not written!
		price: {type: DataTypes.FLOAT, allowNull: false},
		product_name: {type: DataTypes.STRING},
		length: {type: DataTypes.INTEGER},
		width: {type: DataTypes.INTEGER},
		height: {type: DataTypes.INTEGER},
		weight: {type: DataTypes.FLOAT},

		entry_branch: {type: DataTypes.INTEGER}, //where the order is received, In 2nd release, branch id
		entry_branch_type: {type: DataTypes.ENUM('regional', 'sub')}, //Entry branch type
		exit_branch: {type: DataTypes.INTEGER}, //where the order is right now , In 2nd release, branch id
		exit_branch_type: {type: DataTypes.ENUM('regional', 'sub')},
		current_hub: {type: DataTypes.STRING}, //where the product is to be delivered, In 2nd release, branch id
		current_hub_type: {type: DataTypes.ENUM('regional', 'sub')},
		next_hub: {type: DataTypes.STRING}, //Next destination of this product, In 2nd release, branch id
		next_hub_type: {type: DataTypes.ENUM('regional', 'sub')},

		status: {
			type: DataTypes.ENUM('draft','confirmed','ready','running','received','reached','forwarded','stocked','delivered','expired'),
			defaultValue: 'ready',
			allowNull: false
		}

	} , {

		classMethods: {
			associate: function(models){
				//item.belongsTo(models.products , { foreignKey: "productUuid" });
				item.belongsTo(models.order , { foreignKey: "orderUuid" , as:"order" });
				item.hasOne(models.genericTracker , {
					foreignKey: "trackableId" ,
					constraints: false ,
					scope:{ trackableType: "orderItem" },
					as: "tracker"
				});
			}
		}

	});

	item.hook("afterCreate" , function(orderItem , options){
		/**
			* Create a tracker item corresponding to the order
		**/
		if(!moduleSettings.ENABLE_ITEM_TRACKING){
			return;
		}

		orderItem
		.getTracker()
		.then(function(currentTrackerItem){
			if(!currentTrackerItem){

				var trackerData = {};

				trackerData.trackableType = "orderItem";
				trackerData.trackableId = orderItem.uuid;

				trackerData.sourceBranchType = orderItem.entry_branch_type;
				trackerData.sourceBranchId = parseInt(orderItem.entry_branch);

				trackerData.destinationBranchType = orderItem.exit_branch_type;
				trackerData.destinationBranchId = parseInt(orderItem.exit_branch);

				trackerData.currentBranchType = trackerData.sourceBranchType;
				trackerData.currentBranchId = trackerData.sourceBranchId;

				trackerData.previousBranchType = trackerData.sourceBranchType;
				trackerData.previousBranchId = trackerData.sourceBranchId;

				return sequelize.models.genericTracker.create(trackerData);

			}else{

				return Promise.resolve(currentTrackerItem);
			}
		})
		.then(function(trackerItem){

			var p1 = orderItem.getOrder();
			var p2 = Promise.resolve(trackerItem);

			return Promise.all([p1 , p2]);
		})
		.then(function(results){

			console.log("Found result: "+ results);

			var orderInstance = results[0];
			var trackerItem = results[1];

			var p3 = orderInstance.getTracker();
			var p4 = Promise.resolve(trackerItem);

			/*var trackerData = {};

			if(orderInstance.entry_branch_type == "regional-branch"){
				trackerData.sourceBranchType = "regional";
			}else{
				trackerData.sourceBranchType = "sub";
			}
			trackerData.sourceBranchId = parseInt(orderInstance.entry_branch);

			if(orderInstance.exit_branch_type == "regional-branch"){
				trackerData.destinationBranchType = "regional";
			}else{
				trackerData.destinationBranchType = "sub";
			}
			trackerData.destinationBranchId = parseInt(orderInstance.exit_branch);

			trackerData.currentBranchType = trackerData.sourceBranchType;
			trackerData.currentBranchId = trackerData.sourceBranchId;

			var p5 = trackerItem.update(trackerData);*/

			//return Promise.all([p3 , p4 , p5]);
			return Promise.all([p3 , p4]);

		})
		.then(function(results){

			console.log("Found result: "+ results);

			var parentTracker = results[0];
			var trackerItem = results[1];
			//var updateResult = results[2];

			if(parentTracker){
				var p6 = trackerItem.update( { parentTrackerId: parentTracker.uuid } );
				var p7 = parentTracker.update({
					hasChild: true
				});

				return Promise.all([ p6 , p7 ]);
			}else{
				return Promise.reject("No tracker for order");
			}
		})
		.then(function(results){
			console.log(" Post Update parent tracker:  " + results);
		})
		.catch(function(err){
			if(err){
				console.error(err.stack);
			}
		});
	});


	item.hook("beforeDestroy" , function(orderItem , options){		
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
			//console.log(err);
			if(err){
				console.error(err.stack);
			}
		});
	});

	return item;
};
