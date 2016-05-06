var assert = require("chai").assert;

var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelise = DB.Sequelize;
var fs = require("fs");

var shipment = sequelize.models.shipment;
var regionalBranch = sequelize.models.regionalBranch;
var subBranch = sequelize.models.subBranch;
var route = sequelize.models.branchRoute;

var Promise = require("bluebird");

var branchLogic = require("../logics/branchLogic");

var branchUtils = require("../utils/branch");

var BRANCH_DATA = {
  "regional":{
    "label":"T1",
    "sub":[
      {
        "label":"TS1"
      },
      {
        "label": "TS2"
      }
    ]
  }
};

var regionalBranchId = null;
var subBranchIds = [];

describe('branch creation', function(data){
  // body...
  this.timeout(15000);

  beforeEach( function(done){
    // body...

    subBranchIds = [];
    console.log(BRANCH_DATA.regional);

    regionalBranch
    .findOne({ where: { label:BRANCH_DATA.regional.label } })
    .then(function(existingItem){
      if(!existingItem){
          return regionalBranch.create({
            label:BRANCH_DATA.regional.label
          });
      }
      return Promise.resolve(existingItem);
    })
    .then(function(rItem){

      regionalBranchId = rItem.id;

      return Promise.map(BRANCH_DATA.regional.sub , function(subItem){

        console.log(subItem.label);

        return subBranch
        .findOne({ where: { label:subItem.label } })
        .then(function(sItem){
          if(!sItem){

            return subBranch.create({ label:subItem.label , regionalBranchId: rItem.id });
          }else{

            return rItem
            .addSubBranches(sItem)
            .then(function(){
              return Promise.resolve(sItem);
            });
          }
        })
        .then(function(results){

          subBranchIds.push(results);

          return Promise.resolve(results);
        });
      });
    })
    .then(function(results){
        done();
    });
  });

  it('get the regional branch' , function(done){

    branchLogic.getBranch("regional" , regionalBranchId , function(data){
      //assert.equal("regional" , data.data.branchType);
      console.log(data);

      regionalBranchInstance = data.data.dataValues;

      assert.equal(regionalBranchInstance.label , BRANCH_DATA.regional.label);
      //assert.equal(regionalBranchInstance.branchType , "regional");
      assert.equal(regionalBranchInstance.id , regionalBranchId);

      done();
    });
  });

  it("Check the branch utils for generic branch retrieval" , function(done){

    console.log(regionalBranchId);

    branchUtils.getBranchInstance("regional" , regionalBranchId , function(data){

      assert.isOk(data);
      assert.equal(data.id , regionalBranchId);
      //assert.equal(data.branchType , "regional");

      console.log(data);

      done();
    });
  });

  it("check the sub branch in branch utils" , function(done){

      console.log(subBranchIds);

      branchUtils.getBranchInstance("sub" , subBranchIds[0].id , function(data){

        assert.isOk(data);
        assert.equal(data.id , subBranchIds[0].id);
        //assert.equal(data.branchType , "sub");
        console.log(data);
        done();
      });
  });

  it.skip("Update the sub Branch" , function(done){

    var DATA ={
      branchType: "regional"
    };
    branchLogic.updateBranch("regional" , regionalBranchId , DATA , function(data){

      console.log(data);

      assert.isOk(data);
      assert.isOk(data.data);
      //var branchInstance = data.data;
      assert.equal(data.data[0] , 1);

      done();
    });
  });

  it.skip("Delete the regional branch" , function(done){

    var DATA ={
      branchType: "regional"
    };
    branchLogic.deleteBranch("regional" , regionalBranchId , function(data){

      console.log(data);

      assert.isOk(data);
      assert.isOk(data.data);
      //var branchInstance = data.data;
      assert.equal(data.data , 1);

      done();
    });
  });

  it.skip("delete the sub Branches" , function(done){

    branchLogic.deleteBranch("sub" , subBranchIds[0].id , function(data){

      console.log(data);

      assert.isOk(data);
      assert.isOk(data.data);
      //var branchInstance = data.data;
      assert.equal(data.data , 1);

      branchLogic.deleteBranch("sub" , subBranchIds[1].id , function(data){

        console.log(data);

        assert.isOk(data);
        assert.isOk(data.data);
        //var branchInstance = data.data;
        assert.equal(data.data , 1);

        done();
      });
    });
  });

});
