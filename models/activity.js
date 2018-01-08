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

        Activity.belongsTo(models.bundle , {
          foreignKey: "object_id",
          constraints: false,
          as: "bundle"
        });

        Activity.belongsTo(models.order , {
          foreignKey: "object_id",
          constraints: false,
          as: "order"
        });

        Activity.belongsTo(models.item , {
          foreignKey: "object_id",
          constraints: false,
          as: "item"
        });

        Activity.belongsTo(models.admin , {
          foreignKey: "object_id",
          constraints: false,
          as: "operatedOn"
        });

        Activity.belongsTo(models.regionalBranch , {
          foreignKey: "branch_id",
          constraints: false,
          as: 'regionalBranch'
        });

        Activity.belongsTo(models.subBranch , {
          foreignKey: "branch_id",
          constraints: false,
          as: 'subBranch'
        });
      }
    },
    indexes: [
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
