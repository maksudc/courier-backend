var express = require('express');
var router = express.Router();

var bookingDataBinder = require("./booking");
router.use('/booking', bookingDataBinder);


module.exports = router;
