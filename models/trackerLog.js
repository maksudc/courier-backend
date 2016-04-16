var moment = require("moment");
var Promise = require("bluebird");

module.exports = function(sequelize , DataTypes){
  var trackerLog = sequelize.define("trackerLog" , {

    uuid: { type: DataTypes.UUID , primaryKey: true ,  defaultValue: DataTypes.UUIDV1 },
    action: { type: DataTypes.ENUM( "created" , "entrance" , "exit" , "reached" , "block" , "reopen" , "expired" , "delivered" ) , allowNull:true , defaultValue:"created" },
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
      },
    },
    instanceMethods: {

      getBranch: function() {

        if(this.branchType && this.branchId){
          if(this.branchType == "regional"){
            return this.getRegionalBranch();
          }else{
            return this.getSubBranch();
          }
        }
        return Promise.resolve(null);
      }
    }
  });

  return trackerLog;
};
