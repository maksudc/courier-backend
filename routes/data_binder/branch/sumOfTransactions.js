var express = require("express");
var router = express.Router();
var HttpStatus = require("http-status-codes");
var panicUtils = require("./../../../utils/panic");
var Promise = require("bluebird");
var branchTransactionLogic = require("./../../../logics/branchTransactionLogic");
var passport = require("passport");
var moment = require("moment-timezone");
var timezoneConfig = require("./../../../config/timezone");

router.use(passport.authenticate("basic" , {session: false}));

router.get("/", function(req, res){

  var query = req.query;

  dayStr = query["date"] + " 06:00:00";
  queryRangeStartDate = moment.tz(dayStr, timezoneConfig.CLIENT_ZONE);
  queryRangeEndDate = queryRangeStartDate.clone().add(1, 'days').subtract(1, 'seconds');

  query["datetime_range_start"] = queryRangeStartDate.clone().utc().format("YYYY-MM-DD HH:mm:ss");
  query["datetime_range_end"] = queryRangeEndDate.clone().utc().format("YYYY-MM-DD HH:mm:ss");

  previousDateStr = queryRangeStartDate.clone().subtract(1, "days").format("YYYY-MM-DD");
  var openingBalance = 0;

  branchTransactionLogic.getBranchHistoryForDay(query["branch_type"], query["branch_id"], previousDateStr)
  .then(function(previousDateSummaryInstance){

    if(previousDateSummaryInstance){
        openingBalance = previousDateSummaryInstance.get("closing_balance");
    }

    return branchTransactionLogic.getBranchTransactionHistory(query);
  })
  .then(function(result){

    result["opening_balance"] = openingBalance;
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
