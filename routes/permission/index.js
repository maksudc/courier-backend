var express = require("express");
var router = express.Router();

var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

var userPermissionRouter = require("./user");
router.use("/user" , userPermissionRouter);

module.exports = router;
