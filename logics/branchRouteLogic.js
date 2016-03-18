var sequelize = require("../models/connect");
var Sequelize = require("sequelize");
var RouteModel = require("../models/branchRoute");

var RegionalBranchModel = sequelize.RegionalBranch;
var SubBranchModel = sequelize.SubBranch;

var getFullRoute = function(sourceSubBranchId , destinationSubBranchId , next){
    
    SubBranchModel.findOne({where:{ id: sourceSubBranchId }}).catch(function(err){
        if(err){
            next({ "status":"error" , "data":null ,"message":JSON.stringify(err) });
            return;
        }
    }).then(function(sourceSubBranchItem){
        if(sourceSubBranchItem){
            destinationItem = null;
            return 
        }
    }).then(function(destinationItem){
          
    });             
} 