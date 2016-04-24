var assert = require("chai").assert;

var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelise = DB.Sequelize;
var fs = require("fs");

var shipment = sequelize.models.shipment;
var regionalBranch = sequelize.models.regionalBranch;
var subBranche = sequelize.models.subBranch;
var route = sequelize.models.branchRoute;

var branchUtils = require("../utils/branch");

var Promise = require("bluebird");

describe("Order Tests" , function(){

  this.timeout(15000);

  describe('description', function(){


    it("Test sanitization of branch Type" , function(done){

      assert.equal(branchUtils.sanitizeBranchType("sub-branch") , "sub");
      assert.equal(branchUtils.sanitizeBranchType("sub") , "sub");

      assert.equal(branchUtils.sanitizeBranchType("regional-branch") , "regional");
      assert.equal(branchUtils.sanitizeBranchType("regional") , "regional");

      done();

    });

    it("Test desanitization of branch Type" , function(done){

      assert.equal(branchUtils.desanitizeBranchType("sub-branch") , "sub-branch");
      assert.equal(branchUtils.desanitizeBranchType("sub") , "sub-branch");

      assert.equal(branchUtils.desanitizeBranchType("regional-branch") , "regional-branch");
      assert.equal(branchUtils.desanitizeBranchType("regional") , "regional-branch");

      done();
    });
  });
});
