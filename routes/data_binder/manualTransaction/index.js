var express = require('express');
var router = express.Router();

var pendingcashinDataBinder = require("./viewpendingCashin");
router.use('/pendingcashin/view', pendingcashinDataBinder);

var receivedcashinDataBinder = require("./viewreceivedCashin");
router.use('/receivedcashin/view', receivedcashinDataBinder);

var cashoutDataBinder = require("./viewCashout");
router.use('/cashout/view', cashoutDataBinder);

module.exports = router;