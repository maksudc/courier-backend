/**
@deprecated
*/
var express = require("express");
var router = express.Router();
var reportLogic = require("../logics/reportLogic");
var branchLogic = require('../logics/branchLogic');
var upload = require('multer')();
var async = require('async');

var passport = require('passport');
var middleware = require(process.cwd() + '/middleware');
parcelCashinLogic = require("./../logics/reporting/parcel/cashin");

router.use(passport.authenticate('basic', {session: false}));
router.use(middleware.checkPermission);



module.exports = router
