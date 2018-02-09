var express = require('express');
var router = express.Router();
var passport = require("passport");

var ordersDataBinderRouter = require("./orders");
router.use('/orders', ordersDataBinderRouter);

var clientsDataBinderRouter = require("./clients");
router.use("/clients", clientsDataBinderRouter);

module.exports = router;
