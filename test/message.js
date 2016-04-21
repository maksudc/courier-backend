var assert = require("chai").assert;

var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelise = DB.Sequelize;
var fs = require("fs");

var shipment = sequelize.models.shipment;
var regionalBranch = sequelize.models.regionalBranch;
var subBranch = sequelize.models.subBranch;
var route = sequelize.models.branchRoute;
var order = sequelize.models.order;
var trackerLog = sequelize.models.trackerLog;

var Promise = require("bluebird");

function standardizeBranchType(bType){

  if(bType){
    return bType.split("-")[0];
  }

  return null;
}

describe("Message Tests" , function(){

  this.timeout(150000);

  describe('description', function(){

    it("create the order" , function(done){

      var deliveredContent = fs.readFileSync("./test/fixtures/order/preOrderDeliveredFixture.json");
      var preDeliveredOrderData = JSON.parse(deliveredContent);

      var entry_branch = null;
      var exit_branch = null;

      // Get the entry_branch and exit_branch
      var p1 = Promise.resolve(null);
      var p2 = Promise.resolve(null);

      var entryModel = preDeliveredOrderData.entry_hub_type == "sub-branch" ? subBranch : regionalBranch;
      var exitModel = preDeliveredOrderData.exit_hub_type == "sub-branch" ? subBranch : regionalBranch;

      return order
      .findOne({  where: { sender: preDeliveredOrderData.sender , receiver: preDeliveredOrderData.receiver } })
      .then(function(i){

        if(!i){
          return null;
        }
        return Promise.all( [i.getTracker() , i.destroy()]);
      })
      .then(function(ts){

        if(!ts){
          return null;
        }

        t = ts[0];
        if(!t){return null;}

        return Promise.all( [trackerLog.findAll({ where:{ trackerId: t.uuid } }) , t.destroy() ]);
      })
      .then(function(ts){

        if(!ts){
          return null;
        }
        ti = ts[0];
        if(!ti){return null;}

        return Promise.map(ti , function(t){
          return t.destroy();
        });
      })
      .then(function(result){

        return entryModel.findOne({ where: { label: preDeliveredOrderData.entry_hub_label }});
      })
      .then(function(entryB){
          entry_branch = entryB;
      })
      .then(function(){
        return exitModel.findOne({ where: { label: preDeliveredOrderData.exit_hub_label }});
      })
      .then(function(exitB){
        exit_branch = exitB;
      })
      .then(function(){

        console.log(entry_branch.id);
        console.log(exit_branch.id);

        return order.create({

          sender: preDeliveredOrderData.sender,
          receiver: preDeliveredOrderData.receiver,
          status: preDeliveredOrderData.status,

          entry_branch_type: preDeliveredOrderData.entry_hub_type,
          entry_branch: entry_branch.id,

          exit_branch_type: preDeliveredOrderData.exit_hub_type,
          exit_branch: exit_branch.id,

          current_hub_type: standardizeBranchType(preDeliveredOrderData.entry_hub_type),
          current_hub: entry_branch.id
        });
      })
      .then(function(orderItem){
        console.log(orderItem);

        return done();
      });

    });

    it.skip('Check whether order delivered sends a message to the sender' , function(done){

      var deliveredContent = fs.readFileSync("./test/fixtures/order/preOrderDeliveredFixture.json");
      var preDeliveredOrderData = JSON.parse(deliveredContent);

      var entry_branch = null;
      var exit_branch = null;

      // Get the entry_branch and exit_branch
      var p1 = Promise.resolve(null);
      var p2 = Promise.resolve(null);

      var entryModel = preDeliveredOrderData.entry_hub_type == "sub-branch" ? subBranch : regionalBranch;
      var exitModel = preDeliveredOrderData.exit_hub_type == "sub-branch" ? subBranch : regionalBranch;

      return order
      .findOne({  where: { sender: preDeliveredOrderData.sender , receiver: preDeliveredOrderData.receiver } })
      .then(function(orderItem){

          orderItem.status = "stocked";

          orderItem.current_hub_type = standardizeBranchType(orderItem.exit_branch_type);
          orderItem.current_hub = orderItem.exit_branch;

          orderItem.next_hub_type = standardizeBranchType(orderItem.exit_branch_type);
          orderItem.next_hub = orderItem.exit_branch;

          return orderItem.save();
      })
      .then(function(orderItem){
        //
        // orderItem.dataValues.status = "received";
        // orderItem._previousDataValues.status = "running";
        // orderItem._changed.status = true;
        //
        // return orderItem.save();
      })
      .then(function(){
        return done();
      });

    });

  });
});
