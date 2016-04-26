var assert = require("chai").assert;

var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelise = DB.Sequelize;
var fs = require("fs");

var Promise = require("bluebird");

var codeUtils = require("../utils/codegen");

describe('Codegen utility testing', function(data){
  // body...
  //this.timeout(15000);
  it('Format Number' , function(){

    numS = codeUtils.format(10 , "123");
    assert.equal("0000000123" , numS);

    //assert.throws(codeUtils.format(2 , "123") , Error , "Given number's digit length must be smaller than maxNumOfDigits");
  });
});
