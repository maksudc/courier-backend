var Sequelize  = require("sequelize");
var BaseBranchModel = require("./baseBranch");


RegionalBranchModel = function(){};
RegionalBranchModel.prototype = Object.create(BaseBranchModel);

module.exports = RegionalBranchModel;

