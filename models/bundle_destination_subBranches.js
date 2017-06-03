module.exports = function(sequelize , Sequelize){ //Sequelize==DataTypes

  var Bundle_destination_subBranches = sequelize.define('bundle_destination_subBranches' , {
    createdAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    isActive:{
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    bundleId: {
      type: Sequelize.INTEGER,
      references:{
        model: "bundles",
        key: "id"
      }
    },
    subBranchId: {
      type: Sequelize.INTEGER,
      references:{
        model: "subBranches",
        key: "id"
      }
    }
  },
  {
    name: {
      singular: "bundle_destination_subBranches",
      plural: "bundle_destination_subBranches"
    },
    classMethods: {
      associate: function(models){

      }
    }
  });

  Bundle_destination_subBranches.removeAttribute('id');

  return Bundle_destination_subBranches;
};
