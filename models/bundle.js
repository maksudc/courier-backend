
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
    name:{
      type: DataTypes.STRING,
      allowNull: false
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
    },
    phase:{
      type: DataTypes.ENUM("load" , "unload"),
      defaultValue: null,
      allowNull: true
    },
    sealed:{
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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

        Bundle.hasMany(models.item , {
          as: "attachedItems",
          foreignKey: "bundleId",
          sourceKey: "id"
        });
      }
    },
    indexes:[
      {
        name: "bundles_phase",
        method: "BTREE",
        fields: [ "phase" ]
      }
    ]
  });

  return Bundle;
};
