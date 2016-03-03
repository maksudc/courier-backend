var express = require("express");
var router = express.Router();
var RegionController = require("../controllers/region/RegionController");

router.get("/" , RegionController.index);

module.exports = router