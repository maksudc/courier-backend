var Sequelize = require('sequelize');
var sequelize = new Sequelize('dak_harkara', 'dak_harkara', '6hNWSTUyBPrEv9hP');
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

sequelize.sync({"force":true}).then(function(){
    
    // Create the initial data for branches
    var branchData = require("./branch/data");
    
    return 
    sequelize.transaction(function(t){      
                      
        return
        Promise.map(branchData["regionData"] , function(aRegion){
            
            return 
            Region.create(
                {
                    "name": aRegion["name"]
                } , { transaction:t }
            ).then(function(aRegionInstance){

                aRegion["regionalBranch"]["regionId"] = aRegionInstance.getId();
                                                            
                return 
                RegionalBranch.create( aRegion["regionalBranch"] , {  
                    include:[ SubBranch ],
                    transaction:t
                })
                .then(function(regionalBranchInstance){
                    
                    return 
                    Promise.map(aRegion["regionalBranch"]["SubBranches"] , function(aSubBranch){
                        
                        aSubBranch["regionalBranchId"] = regionalBranchInstance.getId();
                        
                        return 
                        SubBranch
                        .create(aSubBranch, { transaction:t });                                                                                                                                                                            
                    });                    
                });                                   
            });
        });        
    });
    /*.then(function(result){
        
                    
    });*/
               
});

module.exports = sequelize;