'use strict';

module.exports = function(sequelize, DataTypes) {
  var Activity = sequelize.define('activity', {
    operator: {
      type: DataTypes.STRING,
      allowNull:false
    },
    operation: {
      type: DataTypes.ENUM('create' , 'update', 'delete' , 'confirm' , 'money_receive' , 'mark_deliverable' , 'seal'),
      allowNull: false
    },
    object_type: {
      type: DataTypes.ENUM('order' , 'bundle' , 'item' , 'user'),
      allowNull: false
    },
    object_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    branch_type: {
      type: DataTypes.ENUM('sub','regional'),
      allowNull: true
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    indexes: [
      {
        name: "activity_operator_index",
        method: "BTREE",
        fields: ["operator"]
      },
      {
        name: "activity_object_operation_index",
        method: "BTREE",
        fields: ["object_type" , "object_id" , "operation"]
      },
      {
        name: "activity_createdAt_branch_index",
        method: "BTREE",
        fields: ["createdAt", "branch_type" , "branch_id"]
      }
    ]
  });
  return Activity;
};
