var express = require("express");
var router = express.Router();
var BranchController = require("../controllers/branch/BranchController");

router.get("/" , BranchController.index);

module.exports = router