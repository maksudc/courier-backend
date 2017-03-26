var express = require('express');
var router = express.Router();

var moneyDataBinderRouter = require("./money");
router.use('/money', moneyDataBinderRouter);

module.exports = router;
