var express = require("express");
var router = express.Router();
var HttpStatus = require("http-status-codes");
var panicUtils = require("./../../../utils/panic");
var Promise = require("bluebird");
var branchTransactionLogic = require("./../../../logics/branchTransactionLogic");
var passport = require("passport");

router.use(passport.authenticate("basic" , {session: false}));

router.get("/", function(req, res){

  branchTransactionLogic.getBranchTransactionHistory(req.query)
  .then(function(result){
    res.status(HttpStatus.OK).send(result);
  })
  .catch(function(err){
    errorMessage = "";
    if(err){
      console.error(err.stack);
      errorMessage = err.message;
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      "error": errorMessage
    });
  });
});


module.exports = router;
