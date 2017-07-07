var express = require('express');
var router = express.Router();

var moneyDataBinderRouter = require("./money");
router.use('/money', moneyDataBinderRouter);

var orderDataBinderRouter = require("./order");
router.use('/order' , orderDataBinderRouter);

var bundleDataBinderRouter = require("./bundle");
router.use("/bundle" , bundleDataBinderRouter);

var clientDataBinderRouter = require("./client");
router.use("/client" , clientDataBinderRouter);

module.exports = router;
