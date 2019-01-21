var express = require("express");
var router = express.Router();
var HttpStatus = require("http-status-codes");
var DB = require("./../../../models/index");
var cashoutModel = DB.sequelize.models.manualTransactions;
var DataTableHelper = require("./../../../utils/data_binder/dataTable");
var panicUtils = require("./../../../utils/panic");
var Promise = require("bluebird");
var branchUtils = require("./../../../utils/branch");
var moment = require("moment-timezone");
var timezoneConfig = require("./../../../config/timezone");
var _ = require("underscore");


router.get('/', function (req, res) {


    tableHelper = new DataTableHelper(req.query);

    userObj = tableHelper.getUser();

    whereQuery = null;

    extraQuery = {
        "transaction_type": "cashout",
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

    cashoutModel
        .findAndCountAll(queryParams)
        .then(function (cashoutList) {

            resultData["data"] = cashoutList;
             resultData["recordsTotal"] = cashoutList.count;
            resultData["recordsFiltered"] = cashoutList.count;


            return Promise.resolve(cashoutList.rows);
            res.status(HttpStatus.OK);
            //  res.send(resultData);
        }).map(function (itemInstance) {

        itemMap = {
            "id": itemInstance.id,
            "createdAt": moment.tz(itemInstance.createdAt, timezoneConfig.COMMON_ZONE).tz(timezoneConfig.CLIENT_ZONE).format("YYYY-MM-DD HH:mm:ss"),
            "created_by": itemInstance.created_by,
            "instructed_by": itemInstance.instructed_by,

        };

        return Promise.all([
            Promise.resolve(itemMap),
            branchUtils.getInclusiveBranchInstance(itemInstance.source_branch_type, itemInstance.source_branch_id),

        ]);
    }).map(function (resultwithbranch) {

        itemMap = resultwithbranch[0];
        branchInstance = resultwithbranch[1];
        itemMap["source_branch_type"] = branchInstance.label;

        return Promise.resolve(itemMap);
    }).then(function (itemMaps) {
        resultData["data"]["rows"] = itemMaps;

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
