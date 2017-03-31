var express = require('express');
var router = express.Router();

var bookingDataBinder = require("./booking");
router.use('/booking', bookingDataBinder);

var deliverableDataBinder = require("./deliverable");
router.use("/deliverable" , deliverableDataBinder );

module.exports = router;
