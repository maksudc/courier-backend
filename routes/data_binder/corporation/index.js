var express = require('express');
var router = express.Router();
var passport = require("passport");

var ordersDataBinderRouter = require("./orders");
router.use('/orders', ordersDataBinderRouter);

var clientsDataBinderRouter = require("./clients");
router.use("/clients", clientsDataBinderRouter);

var corporationsDataBinderRouter = require("./corporations");
router.use("/corporations", corporationsDataBinderRouter);

module.exports = router;
