var Sequelize = require("sequelize");

BaseBranchModel = {
    
    label: Sequelize.STRING,
    phone: Sequelize.STRING,
    address: Sequelize.STRING,
    vd_disabled: Sequelize.BOOLEAN,
    branchType: Sequelize.STRING,
    position: Sequelize.GEOMETRY,



};

module.exports = BaseBranchModel;