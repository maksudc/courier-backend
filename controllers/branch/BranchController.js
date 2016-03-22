var DB  = require("../../models/index");
var sequelize = DB.sequelize;

var BranchController = function(){};

BranchController.prototype.index = function(req , res){

    res.send({ "status": "In branch management page" });
};

module.exports = new BranchController();
