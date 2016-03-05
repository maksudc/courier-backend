var sequelize = require("./connect");
var Sequelize = require("sequelize");
var item = require("./itemModel");




var order = sequelize.define('order', {
	uuid: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV1},
	confirm_time: {type: Sequelize.DATE},
	receive_time: {type: Sequelize.DATE},
	delivery_time: {type: Sequelize.DATE},
	sender: {type: Sequelize.STRING, allowNull: false}, //sender mobile
	receiver: {type: Sequelize.STRING, allowNull: false}, //receiver mobile
	entry_hub: {type: Sequelize.STRING}, //where the order is received
	exit_hub: {type: Sequelize.STRING}, //where the order is right now
	current_hub: {type: Sequelize.STRING}, //where the product is to be delivered
	operator: {type: Sequelize.STRING}, //operator who received this product
	payment: {type: Sequelize.FLOAT, allowNull: false}, //cost of the order
	payment_status: {type: Sequelize.ENUM('unpaid', 'paid'), defaultValue: 'paid'}, //status of payment
	receiver_operator: {type: Sequelize.STRING}, //operator who took the money,
	status: {
		type: Sequelize.ENUM('draft', 'confirmed', 'received', 'travelling', 'reached', 'delivered'),
		defaultValue: 'draft', 
		allowNull: false
	}
});

order.hasMany(item);
item.hasOne(order);

order.sync();

module.exports = order;