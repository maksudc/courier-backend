'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('SiteSettings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: { type: Sequelize.STRING , allowNull: false },
      slug: { type: Sequelize.STRING , allowNull: false , unique: true },
      dtype: { type: Sequelize.ENUM( "string" , "int" , "json" , "boolean" ) , allowNull: false , defaultValue: "string" },
      value: { type: Sequelize.STRING, allowNull: true , defaultValue: null },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('SiteSettings');
  }
};
