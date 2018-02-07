var express = require('express');
var router = express.Router();
var passport = require("passport");

var ordersDataBinderRouter = require("./orders");
router.use('/orders', ordersDataBinderRouter);

module.exports = router;
