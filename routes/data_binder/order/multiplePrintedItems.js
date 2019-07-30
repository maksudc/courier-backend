var express = require("express");
var router = express.Router();
var HttpStatus = require("http-status-codes");
var branchUtils = require("./../../../utils/branch");
var DB = require("./../../../models/index");
var itemModel = DB.sequelize.models.item;
var DataTableHelper = require("./../../../utils/data_binder/dataTable");
var panicUtils = require("./../../../utils/panic");

router.get('/', function (req, res) {

    tableHelper = new DataTableHelper(req.query);
    userObj = tableHelper.getUser();

    whereQuery = null;

    extraQuery = {
        "printcounter": {
            gt: 1
        }

    };


    whereQuery = tableHelper.getWhere(extraQuery);

    queryParams = {};
    queryParams["limit"] = tableHelper.getLimit();
    queryParams["offset"] = tableHelper.getOffset();
    queryParams["where"] = whereQuery;
    queryParams["order"] = tableHelper.getOrder() || "bar_code DESC";

    var resultData = {};
    resultData["draw"] = tableHelper.getDraw();

    itemModel
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
