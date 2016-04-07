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
			type: DataTypes.ENUM('super_admin', 'system_operator', 'accountant', 'branch_operator', 'operator'), 
			defaultValue: 'operator',
			allowNull: false
		},
		mobile: {type: DataTypes.STRING, allowNull: false, unique: true}
	} , {

		classMethods: {
			associate: function(models){
				admin.belongsTo(models.regionalBranch , { foreignKey: 'regional_branch_id' });
				admin.belongsTo(models.subBranch , { foreignKey: 'sub_branch_id' });
				admin.belongsTo(models.region , { foreignKey: 'region_id' });
			}
		}
	});

	return admin;
};
