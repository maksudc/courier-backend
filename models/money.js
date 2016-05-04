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
		delivery_time: {type: DataTypes.DATE},
		status: {
			type: DataTypes.ENUM('draft','received', 'deliverable','delivered'),
			defaultValue: 'draft',
			allowNull: false
		},
		type: {
			type: DataTypes.ENUM('general', 'virtual_delivery'),
			defaultValue: 'general'
		},
		payParcelPrice: {
			type: DataTypes.ENUM('buyer', 'seller')
		}
	} , {

		classMethods: {
			associate: function(models){
				money.belongsTo(models.regionalBranch , { foreignKey: 'regional_branch_id' });
				money.belongsTo(models.subBranch , { foreignKey: 'sub_branch_id' });
				money.belongsTo(models.region , { foreignKey: 'region_id' });
				money.belongsTo(models.region , { foreignKey: 'source_region_id' });
				money.belongsTo(models.region , { foreignKey: 'source_regional_branch_id' });
				money.belongsTo(models.region , { foreignKey: 'source_sub_branch_id' });
				money.belongsTo(models.admin , { foreignKey: 'receiver_operator' });
				money.belongsTo(models.admin , { foreignKey: 'deliver_operator' });
				money.belongsTo(models.admin , { foreignKey: 'payment_receiver_operator' });
				money.belongsTo(models.order , { foreignKey: 'money_order_id' });
			}
		}
	});

	return money;
};


/*
'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    

      queryInterface.addColumn("money" , "vd_order_id" , {

        type: Sequelize.UUID,
        allowNull: true,
        references:{
          model: "orders",
          key: "uuid"
        }
      }).then(function(){
        queryInterface.sequelize.query(
          " ALTER TABLE `money` ADD CONSTRAINT `money_ibfk_7` FOREIGN KEY (`vd_order_id`) REFERENCES `orders` ( `uuid` ) ON DELETE SET NULL ON UPDATE CASCADE; "
        );
      });
  },

  down: function (queryInterface, Sequelize) {
    
    
      queryInterface.removeColumn("money" , "vd_order_id").then(function(){
        queryInterface.sequelize.query(
          "ALTER TABLE `money` DROP FOREIGN KEY `vd_order_id_foreign_idx`;"
        )
      });
    
  }
};

*/
