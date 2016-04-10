'use strict';

module.exports = function(sequelize , DataTypes){

	var money = sequelize.define('money', {
		sender_full_name: {type: DataTypes.STRING, allowNull: false},
		sender_mobile: {type: DataTypes.STRING, allowNull: false},
		sender_nid: {type: DataTypes.STRING},
		sender_verification_code: {type: DataTypes.STRING, allowNull: false},
		receiver_full_name: {type: DataTypes.STRING, allowNull: false},
		receiver_mobile: {type: DataTypes.STRING, allowNull: false},
		receiver_nid: {type: DataTypes.STRING},
		receiver_verification_code: {type: DataTypes.STRING, allowNull: false},
		amount: {type: DataTypes.INTEGER, allowNull: false},
		charge: {type: DataTypes.INTEGER, allowNull: false},
		vat: {type: DataTypes.BOOLEAN},
		discount: {type: DataTypes.INTEGER},
		payable: {type: DataTypes.INTEGER, allowNull: false},
		paid: {type: DataTypes.BOOLEAN, defaultValue: false},
		payment_time: {type: DataTypes.DATE},
		delivery_time: {type: DataTypes.DATE}
	} , {

		classMethods: {
			associate: function(models){
				money.belongsTo(models.regionalBranch , { foreignKey: 'regional_branch_id' });
				money.belongsTo(models.subBranch , { foreignKey: 'sub_branch_id' });
				money.belongsTo(models.region , { foreignKey: 'region_id' });
				money.belongsTo(models.admin , { foreignKey: 'receiver_operator' });
				money.belongsTo(models.admin , { foreignKey: 'deliver_operator' });
				money.belongsTo(models.admin , { foreignKey: 'payment_receiver_operator' });
			}
		}
	});

	return money;
};
