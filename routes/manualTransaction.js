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

router.post("/create", upload.array(), function (req, res) {

    postData = {};
    postData['amount'] = req.body.amount;
    postData['branch_type'] = req.body.branch_type;
    postData['branch_id'] = req.body.branch_id;
    postData['transaction_type'] = req.body.transaction_type;
    postData['transaction_method'] = req.body.transaction_method;
    postData['payment_reference'] = req.body.payment_reference;
    postData['payment_description'] = req.body.payment_description;
    postData['created_by'] = req.user.email;


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
    return manualTransaction.update(
        {
            recieved_by: req.user.email,
            status: "received"
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


module.exports = router;
