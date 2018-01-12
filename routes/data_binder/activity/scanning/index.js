var express = require('express');
var router = express.Router();

var orderScanningActivityDataBinderRouter = require("./order");
router.use('/order', orderScanningActivityDataBinderRouter);

module.exports = router;
