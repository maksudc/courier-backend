var Sequelize = require("sequelize");

BaseBranchModel = {
    
    label: Sequelize.STRING,
    branchType: Sequelize.STRING,
    position: Sequelize.GEOMETRY
};

module.exports = BaseBranchModel;