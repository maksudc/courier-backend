var express = require('express');
var router = express.Router();
var passport = require("passport");

router.use(passport.authenticate('basic', {session: false}));

var adminActivityDataBinderRouter = require("./admin");
router.use('/admin', adminActivityDataBinderRouter);

var scanningActivityDataBinderRouter = require("./scanning");
router.use('/scanning' , scanningActivityDataBinderRouter);

module.exports = router;
