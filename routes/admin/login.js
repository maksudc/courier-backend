var express = require('express');
var router = express.Router();
var passport = require('passport');
var upload = require('multer')();


// router.post('/', function(req, res, next) {
//   console.log(req.session);
//   if(req.isAuthenticated()) {
//     return res.send({"status": "success"});
//   }
//   passport.authenticate('local', function(err, user, info) {
//     if (err) {
//       return res.send({"status": "error", "message": err});
//     }
//     else if (!user) { 
//       return res.send({"status": "error", "message": "Email and password mismatched"});
//     }
    
//     else req.logIn(user, function(err) {
//       if (err){
//         console.log(err);
//         return res.send({"status": "error", "message": "Unknown error occurred"});
//       }
//       else{
//         req.login();
//         return res.send({"status": "success"});
//       }
//     });
//   })(req, res, next);
// });


router.post('/',
  passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    console.log("Here is me!!!!");
    res.send({"status": "success"});
  });



router.get('/success', function(req, res){
	res.send("Log in successfull!!!");
});

router.get('/failure', function(req, res){
	res.send("Log in failed. Username and password");
});

module.exports = router;