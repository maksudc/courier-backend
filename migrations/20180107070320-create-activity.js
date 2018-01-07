'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('activities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      operator: {
        type: Sequelize.STRING,
        allowNull:false
      },
      operation: {
        type: Sequelize.ENUM('create' , 'update', 'delete' , 'confirm' , 'money_receive' , 'mark_deliverable' , 'seal'),
        allowNull: false
      },
      object_type: {
        type: Sequelize.ENUM('order' , 'bundle' , 'item' , 'user'),
        allowNull: false
      },
      object_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      branch_type: {
        type: Sequelize.ENUM('sub','regional'),
        allowNull: true
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
    .then(function(){

      return queryInterface.addIndex("activities" , {
        name: "activity_operator_index",
        method: "BTREE",
        fields: ["operator"]
      });
    })
    .then(function(){

      return queryInterface.addIndex("activities" , {
        name: "activity_object_operation_index",
        method: "BTREE",
        fields: ["object_type" , "object_id" , "operation"]
      });
    })
    .then(function(){

      return queryInterface.addIndex("activities" , {
        name: "activity_createdAt_branch_index",
        method: "BTREE",
        fields: ["createdAt", "branch_type" , "branch_id"]
      });
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('activities');
  }
};
