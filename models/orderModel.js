var sequelize = require("./connect");
var Sequelize = require("sequelize");
var item = require("./itemModel");
var product = require("./productModel");


var order = sequelize.define('order', {
	uuid: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV1},
	confirm_time: {type: Sequelize.DATE},
	receive_time: {type: Sequelize.DATE},
	delivery_time: {type: Sequelize.DATE},
	sender: {type: Sequelize.STRING, allowNull: false}, //sender mobile
	sender_addr:{type: Sequelize.STRING},
	receiver: {type: Sequelize.STRING, allowNull: false}, //receiver mobile
	receiver_addr: {type: Sequelize.STRING},
	entry_hub: {type: Sequelize.STRING}, //where the order is received
	exit_hub: {type: Sequelize.STRING}, //where the order is right now
	current_hub: {type: Sequelize.STRING}, //where the product is to be delivered
	operator: {type: Sequelize.STRING}, //operator who received this product
	payment: {type: Sequelize.FLOAT}, //cost of the order
	payment_status: {type: Sequelize.ENUM('unpaid', 'paid'), defaultValue: 'paid'}, //status of payment
	receiver_operator: {type: Sequelize.STRING}, //operator who took the money,
	status: {
		type: Sequelize.ENUM('draft', 'confirmed', 'received', 'travelling', 'reached', 'delivered'),
		defaultValue: 'draft', 
		allowNull: false
	},
	deliveryType: {
		type: Sequelize.ENUM('home', 'branch'),
		defaultValue: 'branch',
		allowNull: false
	},
	packetized :{type: Sequelize.BOOLEAN},	//TO track multiple items not in one packet but under same order
	vd : {type: Sequelize.BOOLEAN},
	vd_id: {type: Sequelize.STRING},
	vd_price: {type: Sequelize.INTEGER}
});


product.hasOne(item, { foreignKey: 'productUuid' });
order.hasOne(item, { foreignKey: 'orderUuid'});

product.sync();
order.sync();
item.sync();

module.exports = order;