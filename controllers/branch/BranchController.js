var sequelize  = require("../../models/connect");

var BranchController = function(){};

BranchController.prototype.index = function(req , res){
    
    res.send({ "status": "In branch management page" });
};

module.exports = new BranchController();