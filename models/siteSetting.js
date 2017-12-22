'use strict';
module.exports = function(sequelize, DataTypes) {
  var SiteSetting = sequelize.define('SiteSetting', {
    name: { type: DataTypes.STRING , allowNull: false },
    slug: { type: DataTypes.STRING , allowNull: false , unique: true },
    dtype: { type: DataTypes.ENUM( "string" , "int" , "json" , "boolean" ) , allowNull: false , defaultValue: "string" },
    value: { type: DataTypes.STRING, allowNull: true , defaultValue: null }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return SiteSetting;
};
