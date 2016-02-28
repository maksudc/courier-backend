var express = require("express");
var router = express.Router();
var sequelize = require("../models/connect");

router.get('/', function(req, res){
	res.send({"status": "In order page"});
});

module.exports = router;


