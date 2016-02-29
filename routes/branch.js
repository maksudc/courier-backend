var express = require("express");
var router = express.Router();

router.get("/" , function(req , res){
    
    res.send({ "status": "In branch management page" });
});

module.exports = router