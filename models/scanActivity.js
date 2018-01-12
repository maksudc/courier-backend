'use strict';

module.exports = function(sequelize, DataTypes) {
  var scanActivity = sequelize.define('scanActivity', {
    operator: {
      type: DataTypes.STRING,
      allowNull:false
    },
    object_type: {
      type: DataTypes.ENUM('order_receipt', 'item'),
      allowNull: false
    },
    object_id: {
      //bar_code for item and order_receipt
      type: DataTypes.STRING,
      allowNull: false
    },
    branch_type: {
      type: DataTypes.ENUM('sub','regional'),
      allowNull: true
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    bundleId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model:{
          tableName: "bundles"
        },
        key: "id",
        onDelete: "cascade",
        onUpdate: "cascade"
      }
    },
    responseCode: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {

        scanActivity.belongsTo(models.order , {
          foreignKey: "object_id",
          constraints: false,
          as: "order"
        });

        scanActivity.belongsTo(models.item , {
          foreignKey: "object_id",
          constraints: false,
          as: "item"
        });

        scanActivity.belongsTo(models.regionalBranch , {
          foreignKey: "branch_id",
          constraints: false,
          as: 'regionalBranch'
        });

        scanActivity.belongsTo(models.subBranch , {
          foreignKey: "branch_id",
          constraints: false,
          as: 'subBranch'
        });

        scanActivity.belongsTo(models.bundle , { foreignKey: "bundleId" , as:"bundle" });
      }
    },
    instanceMethods: {

      getBranch: function(){

        if(this.branch_type == "sub"){
          return this.getSubBranch();
        }
        return this.getRegionalBranch();
      },

      getObject: function(){
        if(this.object_type == "item"){
          return this.getItem();
        }else if(this.object_type == "order_receipt"){
          return this.getOrder();
        }
        return null;
      }
    },
    indexes:[
      {
        name: "scan_object_index",
        method: "BTREE",
        fields: ["object_type" , "object_id" , "responseCode"]
      },
      {
        name: "scan_createdAt_branch_index",
        method: "BTREE",
        fields: ["createdAt", "branch_type" , "branch_id"]
      }
    ]
  });
  return scanActivity;
};
