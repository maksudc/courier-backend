'use strict';

module.exports = function(sequelize , DataTypes){

	var permission = sequelize.define('permission', {
		url: { type: DataTypes.STRING, primaryKey: true},
		system_operator : { type: DataTypes.BOOLEAN},
		accountant : { type: DataTypes.BOOLEAN},
		branch_operator : { type: DataTypes.BOOLEAN},
		operator : { type: DataTypes.BOOLEAN}
	} , {

		classMethods: {
			associate: function(models){
			}
		}
	});

	return permission;
};
