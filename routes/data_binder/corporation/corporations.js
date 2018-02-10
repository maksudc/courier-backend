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
var sequelize = DB.sequelize;
var corporationModel = sequelize.models.corporation;
var clientModel = sequelize.models.client;
var DataTableHelper = require("./../../../utils/data_binder/dataTable");
var passport = require("passport");
var moment = require("moment-timezone");
var timezoneConfig = require("./../../../config/timezone");
var Promise = require("bluebird");
var clientConfig = require("./../../../config/client");
var authMiddleware = require("./../../../middleware/auth");

//router.use(passport.authenticate("basic-corporation-login", {session: false}));
router.use(authMiddleware.hasGenericAccess);

router.get('/', function(req, res){

	tableHelper = new DataTableHelper(req.query);

  var extraQuery = {};
  filterQuery = tableHelper.getExtraFiltering();
  for(key in filterQuery){
    extraQuery[key] = filterQuery[key];
  }
  whereQuery = tableHelper.getWhere(extraQuery);

  var queryParams  = {};
  queryParams["limit"] = tableHelper.getLimit();
  queryParams["offset"] = tableHelper.getOffset();
  queryParams["where"] = whereQuery;
  queryParams["order"] = tableHelper.getOrder() || "createdAt DESC";
  queryParams["attributes"] = [ 'id', 'username', 'name', 'email', 'mobile', 'has_portal_access', 'address'];

	var resultData = {};
	resultData["draw"] = tableHelper.getDraw();

	corporationModel.findAndCountAll(queryParams)
	.then(function(datas){

			resultData["recordsTotal"] = datas.count;
			resultData["recordsFiltered"] = datas.count;

			for(I=0 ; I < datas.rows.length ; I++){
				datas.rows[I].dataValues.createdAt = moment.tz(datas.rows[I].dataValues.createdAt , timezoneConfig.COMMON_ZONE).tz(timezoneConfig.CLIENT_ZONE);
			}
			resultData["data"] = datas;

      return Promise.resolve(datas.rows);
	})
  .map(function(data){

    return Promise.all([data, clientModel.count({ where: { corporationId: data.id } })]);
  })
  .then(function(complexResults){

    resultData["data"]["rows"] = [];
    for(I=0; I< complexResults.length; I++){
      complexResult = complexResults[I];

      corporationData = complexResult[0].dataValues;
      corporationData["num_clients"] = complexResult[1];
      resultData["data"]["rows"].push(corporationData);
    }
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
