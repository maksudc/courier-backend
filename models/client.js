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
		},
		referrer_type: {
			type: DataTypes.ENUM('admin', 'client', 'external'),
			defaultValue: 'admin',
			allowNull: true
		},
		referrer_identifier:{
			type: DataTypes.STRING,
			allowNull: true
		}
	} ,  {

		classMethods: {
			associate: function(models){
				client.belongsTo(models.region , { foreignKey: "regionId" });
				client.belongsTo(models.corporation , { foreignKey: "corporationId", as:"corporation" });
			}
		},
		indexes:[
			{
        name: "client_referrer_index",
        method: "BTREE",
        fields: ["referrer_type" , "referrer_identifier"]
      }
    ]

	});

	return client;
};
