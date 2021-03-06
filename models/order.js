'use strict';

var _ = require("lodash");
var Promise = require("bluebird");

module.exports = function(sequelize, DataTypes) {

	var order = sequelize.define('order', {

		uuid: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV1},
		bar_code: {type: DataTypes.INTEGER, unique: true, allowNull: false, autoIncrement: true},

		type: {type: DataTypes.ENUM('general', 'value_delivery'), defaultValue: 'general', allowNull: false},
		confirm_time: {type: DataTypes.DATE},
		receive_time: {type: DataTypes.DATE},
		pay_time: {type: DataTypes.DATE},
		delivery_time: {type: DataTypes.DATE},
		sender: {type: DataTypes.STRING, allowNull: false}, //sender mobile
		sender_addr: {type: DataTypes.STRING},
		verification_code: {type: DataTypes.INTEGER, defaultValue: Math.floor(Math.random()*10000)},
		nid:{type: DataTypes.STRING},
		receiver: {type: DataTypes.STRING, allowNull: false}, //receiver mobile
		receiver_name: {type: DataTypes.STRING}, //receiver name
		receiver_addr: {type: DataTypes.STRING},

		entry_branch: {type: DataTypes.STRING}, //where the order is received, In 2nd release, branch id
		entry_branch_type: {type: DataTypes.ENUM('regional-branch', 'sub-branch')}, //Entry branch type

		exit_branch: {type: DataTypes.STRING}, //where the order is right now , In 2nd release, branch id
		exit_branch_type: {type: DataTypes.ENUM('regional-branch', 'sub-branch')},

		current_hub_type: {type: DataTypes.ENUM('regional', 'sub')},
		current_hub: {type: DataTypes.STRING}, //where the product is to be delivered, In 2nd release, branch id

		next_hub_type: {type: DataTypes.ENUM('regional', 'sub')},
		next_hub: {type: DataTypes.STRING}, //Next destination of this product, In 2nd release, branch id

		payment: {type: DataTypes.FLOAT}, //cost of the order
		payment_status: {type: DataTypes.ENUM('unpaid', 'paid'), defaultValue: 'unpaid'}, //status of payment

		payment_tag: { type: DataTypes.ENUM('booking' , 'delivery') , allowNull: true },

		payment_hub_type: {type: DataTypes.ENUM('regional', 'sub') , allowNull: true},
		payment_hub: {type: DataTypes.STRING , allowNull:true},

		vat: {type: DataTypes.BOOLEAN, defaultValue: false},
		vat_amount: {type: DataTypes.INTEGER, defaultValue: 15},
		discount : { type: DataTypes.FLOAT , defaultValue: 0 },

		receiver_operator: {type: DataTypes.STRING}, //operator who received this product
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
		due_deliverable: {type: DataTypes.BOOLEAN,defaultValue:false},
		printcounter:{type:DataTypes.INTEGER,defaultValue:0},

		payment_branch_migrate_affected: { type: DataTypes.BOOLEAN , defaultValue: false }
	} , {

		classMethods: {
			associate: function(models){
				//product.hasOne(models.item, { foreignKey: 'productUuid' });
				order.hasMany(models.item, { foreignKey: 'orderUuid' , as:"items"});
				//ShipmentModel.hasMany(order , {foreignKey: 'shipmentUuid'});
				order.belongsTo(models.shipment , { foreignKey: 'shipmentUuid' , as:"shipment" });
				order.hasOne(models.money , { foreignKey: 'money_order_id' , as: "money_order" });

				order.hasOne(models.genericTracker , {
					foreignKey: "trackableId",
					constraints: false,
					scope:{
						trackableType: "order"
					},
					as: 'tracker'
				});

				order.hasMany(models.activity , {
          as: "activities",
          foreignKey: "object_id",
					sourceKey: "bar_code",
          constraints: false,
          scope:{
            object_type: "order"
          }
        });

				order.hasMany(models.activity , {
          as: "scanActivities",
          foreignKey: "object_id",
					sourceKey: "bar_code",
          constraints: false,
          scope:{
            object_type: "order_receipt"
          }
        });
			}
		}
	});

	return order;
};
