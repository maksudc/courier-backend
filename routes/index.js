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
router.use('/shipment' , shipmentRouter);

var branchRouter = require("./branch");
router.use("/branch" , branchRouter);

var routeRouter = require("./branchRoute");
router.use("/routes" , routeRouter);

var regionRouter = require("./region");
router.use("/region" , regionRouter);

/* GET home page. */
router.get('/', function(req, res, next) {
  	res.send({"status": "In home page"});
});

module.exports = router;
