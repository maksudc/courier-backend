'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.removeColumn("scanActivities" , "activityId");
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.addColumn("scanActivities" , "activityId" , {
      type: Sequelize.INTEGER,
      allowNull: false,
      references:{
        model:{
          tableName: "activities"
        },
        key: "id",
        onDelete: "cascade",
        onUpdate: "cascade"
      }
    });
  }
};
