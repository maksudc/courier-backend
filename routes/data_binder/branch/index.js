var express = require('express');
var router = express.Router();

var sumOfTransactions = require("./sumOfTransactions");
router.use("/sumOfTransactions", sumOfTransactions);

module.exports = router;
