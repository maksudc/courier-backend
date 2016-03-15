var express = require('express');
var router = express.Router();
var product = require("../models/priceModel");

//Other routes
var order = require("./order");
router.use('/order', order);

var pricing = require("./pricing");
router.use('/pricing', pricing);

var branchRouter = require("./branch");
router.use("/branch" , branchRouter);

var regionRouter = require("./region");
router.use("/region" , regionRouter);

/* GET home page. */
router.get('/', function(req, res, next) {
  	res.send({"status": "In home page"});
  	product.create({
  		productName: "dummy",
  		unit: "KG",
  		price: 100
  	});
});

module.exports = router;
