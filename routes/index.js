var express = require('express');
var router = express.Router();

//Other routes
<<<<<<< HEAD
// var order = require("./order");
// router.use('/order', order);
var pricing = require("./pricing");
router.use('/pricing', pricing);
var item = require("./item");
router.use('/item', item);
var order = require("./order");
router.use('/order', order);
=======
>>>>>>> Feature: Modified order model with addresses and vd parameters
var product = require("./product");
router.use('/product', product);

var item = require("./item");
router.use('/item', item);
var order = require("./order");
router.use('/order', order);

var branchRouter = require("./branch");
router.use("/branch" , branchRouter);

var regionRouter = require("./region");
router.use("/region" , regionRouter);

/* GET home page. */
router.get('/', function(req, res, next) {
  	res.send({"status": "In home page"});
});

module.exports = router;
