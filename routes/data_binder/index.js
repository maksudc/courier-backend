var express = require('express');
var router = express.Router();

// Panic mode detection and header addition
var panicMiddleware = require("./../../middleware/panic");
router.use(panicMiddleware.addPanicSettingsHeaderIfApplicable);

var moneyDataBinderRouter = require("./money");
router.use('/money', moneyDataBinderRouter);

var orderDataBinderRouter = require("./order");
router.use('/order' , orderDataBinderRouter);

var orderDataBinderRouter = require("./manualTransaction");
router.use('/manualTransaction' , orderDataBinderRouter);

var bundleDataBinderRouter = require("./bundle");
router.use("/bundle" , bundleDataBinderRouter);

var clientDataBinderRouter = require("./client");
router.use("/client" , clientDataBinderRouter);

var corporationBinderRouter = require("./corporation");
router.use("/corporation", corporationBinderRouter);

var activityDataBinderRouter = require("./activity");
router.use("/activity" , activityDataBinderRouter);

var reportingDataBinderRouter = require("./reporting");
router.use("/reporting", reportingDataBinderRouter);

module.exports = router;
