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

var referralOrderBinderRouter = require("./referral/order");
router.use("/referral/order", referralOrderBinderRouter);

var clientOrderBinderRouter = require("./client/order");
router.use("/client/order", clientOrderBinderRouter);

var printDataClientOrderBinderRouter = require("./client/printable_data");
router.use("/client/order/print", printDataClientOrderBinderRouter);

var corporationOrderBinderRouter = require("./corporation/order");
router.use("/corporation/order", corporationOrderBinderRouter);

var printDataClientOrderBinderRouter = require("./client/printable_data");
router.use("/corporation/order/print", printDataClientOrderBinderRouter);

module.exports = router;
