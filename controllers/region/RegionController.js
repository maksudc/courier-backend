var DB = require("../../models/index");
var sequelize = DB.sequelize;
var regionLogic = require("../../logics/regionLogic");

var RegionController = function(){};

RegionController.prototype.index = function(req , res){

    res.send({ "status": "In Region management page" });
    
};

RegionController.prototype.getAll = function(req , res){

	regionLogic.findAll(function(regionList){
		res.send({ "status": "Get all the regions", data: regionList});
	});
    
};

module.exports = new RegionController();
