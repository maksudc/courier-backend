var express = require('express');
var router = express.Router();

//Other routes
var order = require("./order");
router.use('/order', order);


var pricing = require("./pricing");
router.use('/pricing', pricing);

/* GET home page. */
router.get('/', function(req, res, next) {
  	res.send({"status": "In home page"});
});

module.exports = router;
