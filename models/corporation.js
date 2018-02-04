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
    }
  }, {
    classMethods: {
      associate: function(models) {

        Corporation.hasMany(models.client, { foreignKey: "corporationId", as:"clients" });
      }
    }
  });
  return Corporation;
};
