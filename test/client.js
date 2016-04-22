var assert = require("chai").assert;

var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelise = DB.Sequelize;
var fs = require("fs");

var shipment = sequelize.models.shipment;
var regionalBranch = sequelize.models.regionalBranch;
var subBranch = sequelize.models.subBranch;
var route = sequelize.models.branchRoute;
var client = sequelize.models.client;

var clientLogic = require("../logics/clientLogic");

var Promise = require("bluebird");

var CLIENT_FIXTURE = {
  mobile: "01520080138",
  full_name: "Md. Maksud Alam",
  address: "Dhanmondi",
};

describe('Client Testing...', function(done){
  // body...
  before(function(done){

    client
    .findOne({ where: { mobile: CLIENT_FIXTURE.mobile } })
    .then(function(clientItem){
      if(clientItem){
        clientItem.destroy();
      }
    })
    .then(function(){
      done();
    });
  });

  it("creatign a new client" , function(done){

    clientLogic.create(CLIENT_FIXTURE , function(data){
      console.log(data);
      done();
    });
  });
});
