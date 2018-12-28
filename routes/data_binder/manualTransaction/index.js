var express = require('express');
var router = express.Router();

var cashinDataBinder = require("./viewCashin");
router.use('/cashin/view', cashinDataBinder);
var cashoutDataBinder = require("./viewCashout");
router.use('/cashout/view', cashoutDataBinder);

module.exports = router;