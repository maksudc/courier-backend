
module.exports = function(sequelize , DataTypes){

  var Bundle = sequelize.define('bundle' , {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAtBranchType: {
      type: DataTypes.ENUM('regional' , 'sub'),
      allowNull: false
    },
    createdAtBranchId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdBy:{
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM('draft','confirmed','ready','running','received','reached','forwarded','stocked','delivered','expired'),
      defaultValue: 'draft',
      allowNull: false
    }
  },
  {
    classMethods: {
      associate: function(models){

        Bundle.belongsToMany(models.subBranch , {
          as: 'destinationSubBranches',
          through: models.bundle_destination_subBranches,
          foreignKey: 'bundleId',
          otherKey: 'subBranchId'
        });
      }
    }
  });

  return Bundle;
};
