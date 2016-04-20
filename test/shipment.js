var assert = require("chai").assert;

var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelise = DB.Sequelize;

var shipment = sequelize.models.shipment;
sequelize.sync({ force:true });

describe("Shipment Tests" , function(){

  describe('description', function(){
    // body...

    it("shipment creation" , function(done){

      shipment
      .findAll()
      .then(function(rs){
        console.log(rs);
        assert.equal([].length , rs.length);
        done();
      })
      .catch(function(err){
        console.log(err);
        done(err);
      });
    });
  });
});
