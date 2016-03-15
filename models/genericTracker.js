var Sequelize = require("sequelize");
var sequelize = require("./connect");

var GenericTracker = sequelize.define("genericTracker" , {
    
    uuid: { type: Sequelize.UUID , primaryKey:true , defaultValue: Sequelize.UUIDV1 },
    trackableType: { type:Sequelize.ENUM('order' , 'orderItem' , 'shipment') , defaultValue:'order' , allowNull:false },
    trackableId:{ type:Sequelize.UUID , alowNull:false },
    status: { type: Sequelize.ENUM('active' , 'deactive') , defaultValue:"active" ,allowNull:true },            
});

GenericTracker.sync();

module.exports = GenericTracker