var express = require('express');
var router = express.Router();

//Other routes
// var order = require("./order");
// router.use('/order', order);
var product = require("./product");
router.use('/product', product);

var item = require("./item");
router.use('/item', item);

var order = require("./order");
router.use('/order', order);

var shipmentRouter = require("./shipment");
router.use('/shipments' , shipmentRouter);

var branchRouter = require("./branch");
router.use("/branches" , branchRouter);
var transactionRouter=require("./manualTransaction");
router.use("/transactions",transactionRouter);

var trackerRouter = require("./tracker");
router.use("/trackers" , trackerRouter);

var trackerLogRouter = require("./trackerLog");
router.use("/trackerLogs" , trackerLogRouter);

var routeRouter = require("./branchRoute");
router.use("/routes" , routeRouter);

var regionRouter = require("./region");
router.use("/region" , regionRouter);

var dataBinderRouter = require("./data_binder");
router.use("/data-binder" , dataBinderRouter);

var bundleRouter = require("./bundle");
router.use("/bundles" , bundleRouter);

var siteSettingRouter = require("./siteSetting");
router.use("/siteSetting" , siteSettingRouter);

router.use("/admin", require("./admin"));

router.use("/permission", require("./permission"));

router.use("/client", require("./client"));

router.use("/money", require("./money"));
router.use("/report", require("./report"));
router.use("/corporation", require("./corporation"));

router.use("/referrers", require("./referrer"));

/* GET home page. */
router.get('/', function(req, res, next) {
  	res.send({"status": "In home page"});
});

module.exports = router;
