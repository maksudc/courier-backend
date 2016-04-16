'use strict';

module.exports = function(sequelize , DataTypes){

	var permission = sequelize.define('permission', {
		name: {type: DataTypes.STRING, unique: true},
		url: { type: DataTypes.STRING, primaryKey: true},
		description: {type: DataTypes.STRING, allowNull: false},
		system_operator : { type: DataTypes.BOOLEAN, defaultValue: false},
		accountant : { type: DataTypes.BOOLEAN, defaultValue: false},
		branch_operator : { type: DataTypes.BOOLEAN, defaultValue: false},
		operator : { type: DataTypes.BOOLEAN, defaultValue: false},
		client : { type: DataTypes.BOOLEAN, defaultValue: false}
	} , {

		classMethods: {
			associate: function(models){
			}
		}
	});

	return permission;
};
