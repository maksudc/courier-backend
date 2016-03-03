var sequelize  = require("../../models/connect");

var RegionController = function(){};

RegionController.prototype.index = function(req , res){
    
    res.send({ "status": "In Region management page" });
};

module.exports = new RegionController();