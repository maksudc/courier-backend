var Sequelize = require("sequelize");
var sequelize = require("./connect");

var BranchRoute = sequelize.define("branchRoute",{
    //uuid: { type: Sequelize.UUID , primaryKey:true , defaultValue:Sequelize.UUIDV1 },
    midNodes: { type: Sequelize.STRING , allowNull:true },
    sourceId:{
        type: Sequelize.INTEGER,
        references:{
            model: sequelize.RegionalBranch,
            key: "id"
        },
    },
    destinationId:{
        type: Sequelize.INTEGER,
        references:{
            model: sequelize.RegionalBranch,
            key: "id"
        }
    }
});

BranchRoute.sync();

module.exports = BranchRoute;
