'use strict';

module.exports = function(sequelize , DataTypes){

	var admin = sequelize.define('admin', {
		email: { type: DataTypes.STRING, primaryKey: true},
		password: {type: DataTypes.STRING, allowNull: false},
		username: {type: DataTypes.STRING, unique: true, allowNull: false},
		birth_date: { type: DataTypes.DATEONLY},
		full_name: { type: DataTypes.STRING},
		address: { type: DataTypes.STRING},
		national_id: {type: DataTypes.STRING},
		role: {
			type: DataTypes.ENUM('super_admin', 'system_operator',
													 'accountant', 'branch_operator',
													 'operator' , 'monitor_operator',
													 'scan_operator'),
			defaultValue: 'operator',
			allowNull: false
		},
		state: {
	      type: DataTypes.ENUM('active', 'blocked'),
	      defaultValue: 'active',
	      allowNull: false
	    },
	  mobile: {type: DataTypes.STRING, allowNull: false, unique: true},
		can_move_order_in_awaiting: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	} , {

		classMethods: {
			associate: function(models){
				admin.belongsTo(models.regionalBranch , { foreignKey: 'regional_branch_id' });
				admin.belongsTo(models.subBranch , { foreignKey: 'sub_branch_id' });
				admin.belongsTo(models.region , { foreignKey: 'region_id' });

				admin.hasMany(models.activity , {
          as: "supervisions",
          foreignKey: "object_id",
					sourceKey: "email",
          constraints: false,
          scope:{
            object_type: "admin"
          }
        });
			}
		}
	});

	return admin;
};
