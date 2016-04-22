var assert = require("chai").assert;

var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelise = DB.Sequelize;
var fs = require("fs");

var shipment = sequelize.models.shipment;
var regionalBranch = sequelize.models.regionalBranch;
var subBranche = sequelize.models.subBranch;
var route = sequelize.models.branchRoute;

var Promise = require("bluebird");

describe("Shipment Tests" , function(){

  this.timeout(15000);

  describe('description', function(){
    // body...
    it.skip("shipment creation" , function(done){

      var p1 = Promise.resolve(true);

      if(process.env.NODE_ENV == 'test'){
        p1 = sequelize.sync({ force:true });
      }
      // Create the branches
      var branchDataContents = fs.readFileSync("./test/fixtures/routes/branchData.json");
      var branchFixtures = JSON.parse(branchDataContents);

      return p1
      .then(function(){
        return branchFixtures;
      })
      .map(function(branchFixture){

        return regionalBranch.create({
          label: branchFixture.label,
          branchType: branchFixture.branchType
        })
        .then(function(rBranchItem){

          return Promise.map(branchFixture.SubBranches , function(sBranchFixture){

              return subBranche.create({
                label: sBranchFixture.label,
                branchType: sBranchFixture.branchType,
                regionalBranchId: rBranchItem.id
              });
          });
        });
      })
      .then(function(results){
        // Add the Fuxture routes

        var routeFixtureContent = fs.readFileSync("./test/fixtures/routes/routeData.json");
        var routeFixtures = JSON.parse(routeFixtureContent);

        return Promise.map(routeFixtures , function(routeFixture){

          var sourceBranchId = null;
          var destinationBranchId = null;

          return regionalBranch
          .findOne({ where: { label: routeFixture.sourceBranchLabel } })
          .then(function(sourceRegionalBranch){
            sourceBranchId = sourceRegionalBranch.id;
          })
          .then(function(){
            return regionalBranch
            .findOne({ where: { label: routeFixture.destinationBranchLabel } });
          })
          .then(function(destinationBranch){
            destinationBranchId = destinationBranch.id;
          })
          .then(function(){
            return routeFixture.midNodes;
          })
          .map(function(midNodeLabel){
            return regionalBranch.findOne({  where: { label: midNodeLabel } });
          })
          .map(function(midNodeBranch){
            return midNodeBranch.id;
          })
          .then(function(midNodes){

            routeBaseData = {
              sourceId: sourceBranchId,
              destinationId: destinationBranchId,
              midNodes: JSON.stringify(midNodes)
            };
            console.log(routeBaseData);

            return route.create(routeBaseData);

          })
          .then(function(result){
            if(result){
              done();
              return null;
            }
            done(result);
          });
        });
      })
      .catch(function(err){
        done(err);
      });
    });
  });
});
