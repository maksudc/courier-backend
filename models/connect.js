var Sequelize = require('sequelize');
var sequelize = sequelize || new Sequelize('dak_harkara', 'root', '1234');
var Promise = require("bluebird");

var RegionalBranchModel = require("./branch/regionalBranch");
var SubBranchModel = require("./branch/subBranch");
var RegionModel = require("./region/region");

var Region = sequelize.define("region" , {    
    name: Sequelize.STRING
});
var RegionalBranch = sequelize.define("regionalBranch" ,{
    label: Sequelize.STRING,
    branchType: Sequelize.STRING,
    position: Sequelize.GEOMETRY
});
var SubBranch = sequelize.define("subBranch" , {
    label: Sequelize.STRING,
    branchType: Sequelize.STRING,
    position: Sequelize.GEOMETRY
});

RegionalBranch.belongsTo(Region);

RegionalBranch.hasMany(SubBranch);

sequelize.sync();

module.exports = sequelize;
module.exports.Region = Region;
module.exports.RegionalBranch = RegionalBranch;
module.exports.SubBranch = SubBranch;
