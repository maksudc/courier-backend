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
var manualCashinBinderRouter = require("./manualTransaction/cashin");
router.use("/manualTransaction/cashin" , manualCashinBinderRouter);

var manualCashoutBinderRouter = require("./manualTransaction/cashout");
router.use("/manualTransaction/cashout" , manualCashoutBinderRouter);
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

var printDataCorporationOrderBinderRouter = require("./corporation/printable_data");
router.use("/corporation/order/print", printDataCorporationOrderBinderRouter);

var vdSalesReportBinderRouter = require("./vd/sales");
router.use("/vd/sales", vdSalesReportBinderRouter);

module.exports = router;
