'use strict';

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
		},
		
		last_scanned_at: {
      type: DataTypes.DATE,
      allowNull: true
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

				item.belongsTo(models.bundle , {
					as: "containerBundle",
					foreignKey: "bundleId",
					targetKey: "id"
				});

				item.hasMany(models.activity , {
          as: "activities",
          foreignKey: "object_id",
					sourceKey: "bar_code",
          constraints: false,
          scope:{
            object_type: "item"
          }
        });

				item.hasMany(models.scanActivity , {
          as: "scanActivities",
          foreignKey: "object_id",
					sourceKey: "bar_code",
          constraints: false,
          scope:{
            object_type: "item"
          }
        });
			}
		}
	});

	return item;
};
