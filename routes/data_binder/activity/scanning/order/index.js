var express = require('express');
var router = express.Router();

var orderDetailspageScanningActivityDataBinderRouter = require("./details");
router.use('/details', orderDetailspageScanningActivityDataBinderRouter);

module.exports = router;
