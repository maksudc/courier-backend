var express = require('express');
var router = express.Router();
var passport = require('passport');
var upload = require('multer')();


router.post('/',
  passport.authenticate('basic', { session: false }),
  function(req, res) {
  	console.log(req.body);
    // If this function gets called, authentication was successful.
    // req.user` contains the authenticated user.
    res.send({"status": "success"});
  });



router.get('/success', passport.authenticate('basic'), function(req, res){
  console.log(req.isAuthenticated());
	res.send("Log in successfull!!!");
});

router.get('/failure', function(req, res){
	res.send("Log in failed. Username and password");
});

module.exports = router;