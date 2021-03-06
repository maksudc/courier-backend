var express = require("express");
var router = express.Router();

var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');
var HttpStatus = require("http-status-codes");
var adminUtils = require("./../../../utils/admin");
var branchUtils = require("./../../../utils/branch");
var orderLogic = require("./../../../logics/orderLogic");
var DB = require("./../../../models/index");
var orderModel = DB.sequelize.models.order;
var DataTableHelper = require("./../../../utils/data_binder/dataTable");
var passport = require("passport");
var moment = require("moment-timezone");
var timezoneConfig = require("./../../../config/timezone");
var Promise = require("bluebird");
var clientConfig = require("./../../../config/client");

router.use(passport.authenticate("basic-client-login", {session: false}));

router.get('/', function(req, res){

	tableHelper = new DataTableHelper(req.query);

	whereQuery = null;

  $currentDate = moment().utc().tz(timezoneConfig.CLIENT_ZONE);

  $startDate = moment().utc().tz(timezoneConfig.CLIENT_ZONE);
  $startDate.subtract(clientConfig.DEFAULT_ALLOWED_TIME_WINDOW_VAL , clientConfig.DEFAULT_ALLOWED_TIME_WINDOW_UNIT);
  $startDate.set({ hour: 0, minute:0, second:0, millisecond:0 });

  extraQuery = {
		"sender":{
			"$eq": req.user.mobile
		},
    "createdAt":{
      "$and":[
        {
          "$gte": $startDate.tz(timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss")
        },
        {
          "$lte": $currentDate.tz(timezoneConfig.COMMON_ZONE).format("YYYY-MM-DD HH:mm:ss")
        }
      ]
    }
  };

  whereQuery = tableHelper.getWhere(extraQuery);

	queryParams  = {};
	queryParams["limit"] = tableHelper.getLimit();
	queryParams["offset"] = tableHelper.getOffset();
	queryParams["where"] = whereQuery;
	queryParams["order"] = tableHelper.getOrder() || "createdAt DESC";

	var resultData = {};
	resultData["draw"] = tableHelper.getDraw();

	orderModel
		.findAndCountAll(queryParams)
		.then(function(orderList){

				resultData["recordsTotal"] = orderList.count;
				resultData["recordsFiltered"] = orderList.count;

        for(I=0 ; I < orderList.rows.length ; I++){
          orderList.rows[I].dataValues.createdAt = moment.tz(orderList.rows[I].dataValues.createdAt , timezoneConfig.COMMON_ZONE).tz(timezoneConfig.CLIENT_ZONE);
        }
        resultData["data"] = orderList;

				res.status(HttpStatus.OK);
				res.send(resultData);
		})
		.catch(function(err){
			if(err){
				console.error(err.stack);
			}
			res.status(HttpStatus.INTERNAL_SERVER_ERROR);
			res.send({ error:"Internal Server error occured" });
	});

});


module.exports = router;
