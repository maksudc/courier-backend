'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('scanActivities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      activityId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
          model:{
            tableName: "activities"
          },
          key: "id"
        }
      },
      bundleId:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
          model:{
            tableName: "bundles"
          },
          key: "id"
        }
      },
      responseCode: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
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
    return queryInterface.dropTable('scanActivities');
  }
};
