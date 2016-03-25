var moment = require("moment");

module.exports = function(sequelize , DataTypes){

  var trackerLog = sequelize.define("trackerLog" , {

    uuid: { type: DataTypes.UUID , primaryKey:true , defaultValue:sequelize.UUIDV1 },
    action: { type: DataTypes.ENUM( "entrance" , "exit" , "block" , "reopen" ) , allowNull:true },
    trackerId: { type: DataTypes.UUID , allowNull:false },
    branchType: { type: DataTypes.ENUM("regional" , "sub") , allowNull:false , defaultValue:"regional" },
    branchId: { type: DataTypes.INTEGER , allowNull:true },
    description: { type: DataTypes.TEXT , allowNull:true },
    eventDateTime: { type: DataTypes.DATE , allowNull:false , defaultValue:moment.utc().format('YYYY-MM-DD HH:mm:ss') }
  } , {
    classMethods:{

      associate:function(models){

        trackerLog.belongsTo( models.genericTracker , { foreignKey: "trackerId" , name:"trackerForLog" } );

        trackerLog.belongsTo(models.regionalBranch , {
          foreignKey: "branchId" ,
          constraints:false,
          as:"regionalBranch"
        });
        trackerLog.belongsTo(models.subBranch , {
          foreignKey: "branchId",
          constraints: false,
          as: "subBranch"
        });
      }
    }
  });

  return trackerLog;
};
