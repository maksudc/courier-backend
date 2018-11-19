var Sequelize = require("sequelize");

BaseBranchModel = {
    
    label: Sequelize.STRING,
    phone: Sequelize.STRING,
    address: Sequelize.STRING,
    branchType: Sequelize.STRING,
    position: Sequelize.GEOMETRY,



};

module.exports = BaseBranchModel;