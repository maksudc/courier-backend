var express = require("express");
var router = express.Router();
var HttpStatus = require("http-status-codes");
var DB = require("./../../../models/index");
var cashinModel = DB.sequelize.models.manualTransactions;
var DataTableHelper = require("./../../../utils/data_binder/dataTable");
var panicUtils = require("./../../../utils/panic");


router.get('/', function (req, res) {

    tableHelper = new DataTableHelper(req.query);

    userObj = tableHelper.getUser();

    whereQuery = null;

    extraQuery = {
        "transaction_type": "cashin",
        "status": "received",
    };

    if (userObj) {

        if (userObj.getSubBranchId()) {
            extraQuery["branch_id"] = userObj.getSubBranchId();
            extraQuery["branch_type"] = "sub"
        }
        else if (userObj.getRegionalBranchId()) {
            extraQuery["branch_id"] = userObj.getRegionalBranchId();
            extraQuery["branch_type"] = "regional"
        }
    }
    if (panicUtils.isPanicked(req)) {
        extraQuery = panicUtils.attachPanicQuery(extraQuery);
    }
    whereQuery = tableHelper.getWhere(extraQuery);

    queryParams = {};
    queryParams["limit"] = tableHelper.getLimit();
    queryParams["offset"] = tableHelper.getOffset();
    queryParams["where"] = whereQuery;
    queryParams["order"] = tableHelper.getOrder() || "createdAt DESC";

    var resultData = {};
    resultData["draw"] = tableHelper.getDraw();

    cashinModel
        .findAndCountAll(queryParams)
        .then(function (orderList) {

            resultData["data"] = orderList;
            resultData["recordsTotal"] = orderList.count;
            resultData["recordsFiltered"] = orderList.count;

            res.status(HttpStatus.OK);
            res.send(resultData);
        })
        .catch(function (err) {
            if (err) {
                console.error(err.stack);
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            res.send({error: "Internal Server error occured"});
        });

});

module.exports = router;
