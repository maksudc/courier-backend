'use strict';

module.exports = function(sequelize , DataTypes){

	var client = sequelize.define('client', {
		mobile: { type: DataTypes.STRING, primaryKey: true},
		password: {type: DataTypes.STRING, allowNull: false},
		full_name: { type: DataTypes.STRING},
		address: { type: DataTypes.STRING},
		verification_code: {type: DataTypes.INTEGER},
		national_id: {type: DataTypes.STRING},
		status: {
			type: DataTypes.ENUM('draft', 'verified'),
			defaultValue: 'draft',
			allowNull: false
		},
		has_portal_access: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	} ,  {

		classMethods: {
			associate: function(models){
				client.belongsTo(models.region , { foreignKey: "regionId" });
				client.belongsTo(models.corporation , { foreignKey: "corporationId", as:"corporation" });
			}
		}

	});

	return client;
};
