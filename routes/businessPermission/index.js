var express = require("express");
var router = express.Router();

var userACLRouter = require("./user");
router.use("/user" , userACLRouter);


module.exports = router;
