var Sequelize = require("sequelize");
var BaseBranchModel = require("./baseBranch");

SubBranchModel = function(){};
SubBranchModel.prototype = Object.create(BaseBranchModel);

module.exports = SubBranchModel;