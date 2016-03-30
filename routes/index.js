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

var trackerRouter = require("./tracker");
router.use("/trackers" , trackerRouter);

var trackerLogRouter = require("./trackerLog");
router.use("/trackerLogs" , trackerLogRouter);

var routeRouter = require("./branchRoute");
router.use("/routes" , routeRouter);

var regionRouter = require("./region");
router.use("/region" , regionRouter);

router.use("/admin", require("./admin"));

/* GET home page. */
router.get('/', function(req, res, next) {
  	res.send({"status": "In home page"});
});

module.exports = router;
