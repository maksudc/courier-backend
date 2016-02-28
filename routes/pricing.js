var express = require("express");
var router = express.Router();

router.get('/', function(req, res){
	res.send({"status": "In product pricing page"});
});

module.exports = router;