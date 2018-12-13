var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer();
var DB = require("../models/index");
var sequelize = DB.sequelize;
var manualTransaction = sequelize.models.manualTransactions;
var passport = require('passport');
var bodyParser = require('body-parser');


router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

var passport = require('passport');
var middleware = require(process.cwd() + '/middleware');


router.use(passport.authenticate('basic', {session: false}));
router.use(middleware.checkPermission);

router.post("/cashin", upload.array(), function (req, res) {

    postData = req.body;


    manualTransaction
        .create(postData)
        .then(function (result) {
            res.send({status: "success", data: result, message: postData});
        })
        .catch(function (err) {
            if (err) {
                console.error(err.stack);
            }
            res.send({status: "error", data: null, message: err});

        })
});

module.exports = router;
