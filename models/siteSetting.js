
module.exports = function(sequelize , DataTypes){

  var SiteSetting = sequelize.define("siteSetting" , {

    name: { type: DataTypes.STRING , allowNull: false },
    slug: { type: DataTypes.STRING , allowNull: false , unique: true },
    dtype: { type: DataTypes.ENUM( "string" , "int" , "json" ) , allowNull: false , defaultValue: "string" },
    value: { type: DataTypes.STRING, allowNull: true , defaultValue: null }
  });

  return siteSetting;
};
