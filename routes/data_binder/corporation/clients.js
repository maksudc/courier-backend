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
var corporationModel = DB.sequelize.models.corporation;
var clientModel = DB.sequelize.models.client;
var DataTableHelper = require("./../../../utils/data_binder/dataTable");
var passport = require("passport");
var moment = require("moment-timezone");
var timezoneConfig = require("./../../../config/timezone");
var Promise = require("bluebird");
var clientConfig = require("./../../../config/client");
var authMiddleware = require("./../../../middleware/auth");

//router.use(passport.authenticate("basic-corporation-login", {session: false}));
router.use(authMiddleware.hasGenericAccess);

router.get('/:corporationId', function(req, res){

	tableHelper = new DataTableHelper(req.query);

  var extraQuery = {};
  extraQuery["corporationId"] = {
    "$eq": req.params.corporationId
  };
  filterQuery = tableHelper.getExtraFiltering();
  for(key in filterQuery){
    extraQuery[key] = filterQuery[key];
  }
  whereQuery = tableHelper.getWhere(extraQuery);

  var queryParams  = {};
  if(tableHelper.getLimit()){
    queryParams["limit"] = tableHelper.getLimit();
  }
  queryParams["offset"] = tableHelper.getOffset();
  queryParams["where"] = whereQuery;
  queryParams["order"] = tableHelper.getOrder() || "createdAt DESC";
  queryParams["attributes"] = [ 'mobile', 'full_name', 'address', 'status', 'createdAt', 'has_portal_access', 'corporationId'];

	var resultData = {};
	resultData["draw"] = tableHelper.getDraw();

	clientModel.findAndCountAll(queryParams)
	.then(function(clientList){

			resultData["recordsTotal"] = clientList.count;
			resultData["recordsFiltered"] = clientList.count;

			for(I=0 ; I < clientList.rows.length ; I++){
				clientList.rows[I].dataValues.createdAt = moment.tz(clientList.rows[I].dataValues.createdAt , timezoneConfig.COMMON_ZONE).tz(timezoneConfig.CLIENT_ZONE);
			}
			resultData["data"] = clientList;

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
