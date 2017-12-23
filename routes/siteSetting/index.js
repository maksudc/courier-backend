var express = require("express");
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var panicRouter = require("./panic");
router.use("/panic" , panicRouter);

var updateRouter = require("./update");
router.use("/update" , updateRouter);

module.exports = router;
