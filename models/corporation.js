'use strict';
module.exports = function(sequelize, DataTypes) {
  var Corporation = sequelize.define('corporation', {
    username:{
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password:{
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING ,
      allowNull: false
    },
    email:{
      type: DataTypes.STRING,
      allowNull: true
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address:{
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'verified'),
      allowNull: false,
      defaultValue: 'draft'
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
  }, {
    classMethods: {
      associate: function(models) {

        Corporation.hasMany(models.client, { foreignKey: "corporationId", as:"clients" });
      }
    },
    indexes:[
			{
        name: "corporation_referrer_index",
        method: "BTREE",
        fields: ["referrer_type" , "referrer_identifier"]
      }
    ]
  });
  return Corporation;
};
