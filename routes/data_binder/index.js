var express = require('express');
var router = express.Router();

var moneyDataBinderRouter = require("./money");
router.use('/money', moneyDataBinderRouter);

var orderDataBinderRouter = require("./order");
router.use('/order' , orderDataBinderRouter);

module.exports = router;
