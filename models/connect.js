var Sequelize = require('sequelize');
var sequelize = new Sequelize('dak_harkara', 'dak_harkara', '6hNWSTUyBPrEv9hP');

var RegionalBranchModel = require("./branch/regionalBranch");
var SubBranchModel = require("./branch/subBranch");
var RegionModel = require("./region/region");

var Region = sequelize.define("region" , RegionModel);
var RegionalBranch = sequelize.define("regionalBranch" , RegionalBranchModel);
var SubBranch = sequelize.define("subBranch" , SubBranchModel);

Region.hasOne(RegionalBranch);

RegionalBranch.hasMany(SubBranch);

module.exports = sequelize;