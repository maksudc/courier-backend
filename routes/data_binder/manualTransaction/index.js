var express = require('express');
var router = express.Router();


var pendingcashinDataBinder = require("./viewpendingCashin");
router.use('/pendingcashin/view', pendingcashinDataBinder);

var receivedcashinDataBinder = require("./viewreceivedCashin");
router.use('/receivedcashin/view', receivedcashinDataBinder);

var pendingcashoutDataBinder = require("./viewpendingCashout");
router.use('/pendingcashout/view', pendingcashoutDataBinder);

var receivedcashoutDataBinder = require("./viewreceivedCashout");
router.use('/receivedcashout/view', receivedcashoutDataBinder);

var cashoutDataBinder = require("./viewCashout");
router.use('/cashout/view', cashoutDataBinder);

module.exports = router;
