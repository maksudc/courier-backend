var express = require('express');
var router = express.Router();

/* Order route definitions */
router.use('/login', require('./login'));


router.get('/', function(req, res){
	res.send("In Admin page");
});

router.get('/logout', function(req, res){
	req.logout();	
	res.redirect('/');
});


module.exports = router;