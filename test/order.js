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

describe("Order Tests" , function(){

  this.timeout(15000);

  describe('description', function(){


  });
});
