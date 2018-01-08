'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addColumn("scanActivities", "object_type" , {
      type: Sequelize.ENUM('order_receipt', 'item'),
      allowNull: false
    })
    .then(function(){
      return queryInterface.addColumn("scanActivities", "object_id" , {
        //bar_code for item and order_receipt
        type: Sequelize.STRING,
        allowNull: false
      });
    })
    .then(function(){

      return queryInterface.addColumn("scanActivities", "branch_type", {
        type: Sequelize.ENUM('sub','regional'),
        allowNull: true
      });
    })
    .then(function(){

      return queryInterface.addColumn("scanActivities", "branch_id", {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    })
    .then(function(){

      return queryInterface.addIndex("scanActivities" ,   {
          name: "scan_object_index",
          method: "BTREE",
          fields: ["object_type" , "object_id" , "responseCode"]
        });
    })
    .then(function(){

      return queryInterface.addIndex("scanActivities", {
        name: "scan_createdAt_branch_index",
        method: "BTREE",
        fields: ["createdAt", "branch_type" , "branch_id"]
      });
    });
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.removeIndex("scanActivities" , "scan_createdAt_branch_index")
    .then(function(){
      return queryInterface.removeIndex("scanActivities" , "scan_object_index");
    })
    .then(function(){
      return queryInterface.removeColumn("scanActivities" , "object_type");
    })
    .then(function(){
      return queryInterface.removeColumn("scanActivities" , "object_id");
    })
    .then(function(){
      return queryInterface.removeColumn("scanActivities" , "branch_type");
    })
    .then(function(){
      return queryInterface.removeColumn("scanActivities" , "branch_id");
    });
  }
};
