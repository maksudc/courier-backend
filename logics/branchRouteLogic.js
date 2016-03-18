var sequelize = require("../models/connect");
var Sequelize = require("sequelize");
var RouteModel = require("../models/branchRoute");
var Promise = require("bluebird");

var RegionalBranchModel = sequelize.RegionalBranch;
var SubBranchModel = sequelize.SubBranch;

var getFullRouteBetween = function(sourceSubBranchId , destinationSubBranchId , next){
    
    /*Promise.map([ sourceSubBranchId , destinationSubBranchId ] , function(currentSubBranchId){
        
        return         
        SubBranchModel
        .findOne({where:{ id: currentSubBranchId }})
        .catch(function(err){
            console.log(err);
        })
    })  */ 
    
    var sourceSubBranchItem = null;
    var destinationSubBranchItem = null;
     
     var p1 = SubBranchModel
    .findOne({where:{ id: sourceSubBranchId }});
    /*.then(function(resultSourceSubBranchItem){
        
        sourceSubBranchItem = resultSourceSubBranchItem;                               
        console.log(resultSourceSubBranchItem.id);  
        
        return Promise.resolve(resultSourceSubBranchItem);                                        
    });*/
    
    var p2 = 
                                   
    SubBranchModel
    .findOne({ where:{ id: destinationSubBranchId } });
    
    /*.then(function(resultDestinationSubBranchItem){
            
            console.log(resultDestinationSubBranchItem);
            //console.log(sourceSubBranchItem);
            destinationSubBranchItem = resultDestinationSubBranchItem;                   
    });*/
    
    
    
    Promise.all([p1 , p2]).then(function(results){
        
        console.log(results[0].regionalBranchId);
        console.log(results[1].regionalBranchId);
        
        RouteModel.findOne({
            where: {
                                
                sourceId: results[0].regionalBranchId,
                destinationId: results[1].regionalBranchId,
            }
        })
        .then(function(routeItem){
        
            console.log(" Found Route Item ");
            console.log(routeItem);
            
            if(routeItem){
                
                midNodes = routeItem.midNodes;
            
                console.log(" MidNodes ");
                if(midNodes){
                    
                    midNodes = JSON.parse(midNodes);               
                }              
                console.log(midNodes);
                
                return Promise.resolve(midNodes);
            }
            
            return ;               
        })
        .then(function(midNodeIds){
            
            console.log("Working on a single Midnode");
            console.log(midNodeIds);
            
            promises = [];
            for(I = 0 ; I< midNodeIds.length ; I++){
                
                p = RegionalBranchModel.findOne({ where: { id: midNodeIds[I] } });
                promises.push(p);                                   
            }            
                        
            Promise.all(promises)
            .then(function(midNodesExpanded){
            
                console.log(" Almost complete  ");
                console.log(midNodesExpanded);
            
                next(midNodesExpanded);
            })
        })        
        .catch(function(err){
            
            if(err){
                next({ "status":"error" , "data":null ,"message":JSON.stringify(err) });
                return;
            }
        }); 
    });
 /*   .spread(function(sourceRegionalBranchId , destinationRegionalBranchId){
        
        
        return 
        RouteModel.findOne({
            where: {
                
                sourceId: sourceRegionalBranchId,
                destinationId: destinationSubBranchId,
            }
        })
    })*/                    
};

exports.getFullRouteBetween = getFullRouteBetween;