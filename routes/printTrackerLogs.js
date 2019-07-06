var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer();
var DB = require("../models/index");
var sequelize = DB.sequelize;
var printTrackerLog = sequelize.models.printTrackerLogs;
var bodyParser = require('body-parser');
var _ = require("underscore");


router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

var passport = require('passport');
var middleware = require(process.cwd() + '/middleware');
var aclMiddleware = require(process.cwd() + '/middleware/acl');


router.use(passport.authenticate('basic', {session: false}));

router.post("/create", upload.array(), function (req, res) {

    postData = {};
    postData['uuid'] = req.body.uuid;
    postData['print_type'] = req.body.print_type;
    postData['print_no'] = req.body.print_no;
    postData['bar_code']=req.body.bar_code;
    postData['printed_by'] = req.body.printed_by;
    postData['printed_at'] = req.body.printed_at;


    return printTrackerLog.create(postData).then(function (result) {
        console.log(postData);
        res.status(201);
        res.send({status: "success", data: result, message: postData});
    }).catch(function (err) {
        if(err){
          console.error(err.stack);
        }
        res.status(500);
        res.send({status: "error", data: null, message: err});
    });
});

module.exports = router;
