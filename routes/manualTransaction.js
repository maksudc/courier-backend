var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer();
var DB = require("../models/index");
var sequelize = DB.sequelize;
var branchUtils = require("./../utils/branch");
var manualTransaction = sequelize.models.manualTransactions;
var passport = require('passport');
var bodyParser = require('body-parser');
var moment = require("moment-timezone");
var timezoneConfig = require("../config/timezone");
var bundleModel = sequelize.models.bundle;
var HttpStatus = require("http-status-codes");
var Promise = require("bluebird");
var _ = require("underscore");


router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

var passport = require('passport');
var middleware = require(process.cwd() + '/middleware');


router.use(passport.authenticate('basic', {session: false}));
router.use(middleware.checkPermission);

router.post("/create", upload.array(), function (req, res) {

    postData = {};
    postData['amount'] = req.body.amount;
    postData['branch_type'] = req.body.branch_type;
    postData['branch_id'] = req.body.branch_id;
    postData['transaction_type'] = req.body.transaction_type;
    postData['payment_method'] = req.body.payment_method;
    postData['payment_reference'] = req.body.payment_reference;
    postData['payment_description'] = req.body.payment_description;
    postData['created_by'] = req.user.email;
    postData['source_branch_id'] = req.body.source_branch_id;
    postData['source_branch_type'] = req.body.source_branch_type;
    postData['instructed_by'] = req.body.instructed_by;


    sequelize.transaction(function (t) {
        return manualTransaction.create(postData, {transaction: t})
    }).then(function (result) {
        res.status(201);
        res.send({status: "success", data: result, message: postData});


    }).catch(function (err) {
        res.status(500);
        res.send({status: "error", data: null, message: err});
        throw new Error();

    });
});

router.put("/receivetransaction/:id", function (req, res) {

    received_at = moment.tz(timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss");

    return manualTransaction.update(
        {
            received_by: req.user.email,
            status: "received",
            received_at: received_at
        },
        {where: {id: req.params.id}}
    ).then(function (result) {
        res.status(200);
        res.send({status: "success", data: result})
    }).catch(function (err) {
        res.status(500);
        res.send({status: "error", data: null, message: err})
    });

})
var manualtransactionDetails = {};
var transaction_details = null;
router.get("/details/:id", function (req, res) {


    return manualTransaction.findOne({
        where: {
            id: req.params.id
        }
    }).then(function (transactionDetails) {
        transaction_details = transactionDetails;
        return branchUtils.getInclusiveBranchInstance(transactionDetails.source_branch_type, transactionDetails.source_branch_id);
    }).then(function (branchinfo) {
        manualtransactionDetails['created_by'] = transaction_details.created_by;
        manualtransactionDetails['creation_date'] = transaction_details.createdAt;
        manualtransactionDetails['instructed_by'] = transaction_details.instructed_by;
        manualtransactionDetails["id"] = transaction_details.id;
        manualtransactionDetails["branch_type"] = transaction_details.source_branch_type
        manualtransactionDetails['branch_label'] = branchinfo.label;
        manualtransactionDetails['description']=transaction_details.payment_description

        res.send({data: manualtransactionDetails});

    }).catch(function (err) {
        res.status(500);
        res.send({status: "error", data: null, message: err})
    });

})


module.exports = router;
