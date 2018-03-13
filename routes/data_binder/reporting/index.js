var express = require('express');
var router = express.Router();

var parcelCashinBinderRouter = require("./parcel/cashin");
router.use('/parcel/cashin', parcelCashinBinderRouter);

var parcelSalesBinderRouter = require("./parcel/sales");
router.use("/parcel/sales", parcelSalesBinderRouter);

// var parcelCashoutBinderRouter = require("./parcel/cashout");
// router.use('/parcel/cashout' , parcelCashoutBinderRouter);
//
var moneyCashinBinderRouter = require("./money/cashin");
router.use("/money/cashin" , moneyCashinBinderRouter);

var moneyCashoutBinderRouter = require("./money/cashout");
router.use("/money/cashout" , moneyCashoutBinderRouter);

module.exports = router;
