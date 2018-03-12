var express = require("express");
var router = express.Router();

var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');
var HttpStatus = require("http-status-codes");
var adminUtils = require("./../../../../utils/admin");
var branchUtils = require("./../../../../utils/branch");
var orderLogic = require("./../../../../logics/orderLogic");
var DB = require("./../../../../models/index");
var orderModel = DB.sequelize.models.order;
var moneyModel = DB.sequelize.models.money;
var regionalBranchModel = DB.sequelize.models.regionalBranch;
var subBranchModel = DB.sequelize.models.subBranch;
var DataTableHelper = require("./../../../../utils/data_binder/dataTable");
var passport = require("passport");
var moment = require("moment-timezone");
var timezoneConfig = require("./../../../../config/timezone");

router.use(passport.authenticate("basic" , {session: false}));
router.get('/', function(req, res){

	tableHelper = new DataTableHelper(req.query);

	userObj = tableHelper.getUser();

	whereQuery = null;

  extraQuery = {
    status: {
      "$in": ['deliverable', 'delivered']
    }
  };

	extraParamFilterQuery = tableHelper.getExtraFiltering();
	for(key in extraParamFilterQuery){
		extraQuery[key] = extraParamFilterQuery[key];
	}

	whereQuery = tableHelper.getWhere(extraQuery);

	queryParams  = {};
	queryParams["where"] = whereQuery;
	queryParams["order"] = tableHelper.getOrder() || "bar_code ASC";

	var aggregationQueryParams = Object.assign({} , queryParams);

	queryParams["limit"] = tableHelper.getLimit();
	queryParams["offset"] = tableHelper.getOffset();

	var resultData = {};
	resultData["draw"] = tableHelper.getDraw();

  queryParams["attributes"] = [
  			'id', 'payable', 'amount',
  			'charge', 'discount', 'sender_mobile', 'receiver_mobile',
  			'type', 'payment_time' ,
  			'source_sub_branch_id' , 'source_regional_branch_id',
  			'sub_branch_id' , 'regional_branch_id'
  ]

	moneyModel
		.findAndCountAll(queryParams)
		.then(function(moneyList){

				resultData["data"] = moneyList;
				resultData["recordsTotal"] = moneyList.count;
				resultData["recordsFiltered"] = moneyList.count;

				return Promise.all(moneyList.rows);
		})
		.map(function(moneyItem){
			moneyItem.dataValues.payment_time = moment.tz(moneyItem.dataValues.pay_time, timezoneConfig.COMMON_ZONE)
																						.tz(timezoneConfig.CLIENT_ZONE)
																						.format("YYYY-MM-DD HH:mm:ss");
      return moneyItem;
		})
    .map(function(moneyOrderData){

        branchType = null;
        branchId = null;
        if(moneyOrderData["source_sub_branch_id"]){
          branchType = "sub";
          branchId = moneyOrderData["source_sub_branch_id"];
        }else{
          branchType = "regional";
          branchId = moneyOrderData["source_regional_branch_id"];
        }
        return Promise.all([
          Promise.resolve( moneyOrderData ) ,
          branchUtils.getInclusiveBranchInstance(branchType , branchId , null)
        ]);
    })
    .map(function(complexResult){
      moneyOrderData = complexResult[0];
      moneyOrderData.dataValues.sourceBranch = complexResult[1];

      return Promise.resolve(moneyOrderData);
    })
    .map(function(moneyOrderData){

        branchType = null;
        branchId = null;
        if(moneyOrderData["sub_branch_id"]){
          branchType = "sub";
          branchId = moneyOrderData["sub_branch_id"];
        }else{
          branchType = "regional";
          branchId = moneyOrderData["regional_branch_id"];
        }
        return Promise.all([
          Promise.resolve( moneyOrderData ) ,
          branchUtils.getInclusiveBranchInstance(branchType , branchId , null)
        ]);
    })
    .map(function(bundle){
      moneyOrderData = bundle[0];
      moneyOrderData.dataValues.destinationBranch = bundle[1];

      return Promise.resolve(moneyOrderData);
    })
		.then(function(){

			return Promise.resolve(tableHelper.getAggregations());
		})
		.map(function(aggregation_obj){

			if(aggregation_obj.getOperation() == "sum"){

					return Promise.all([
						aggregation_obj ,
						moneyModel.sum(aggregation_obj.getColumn() , aggregationQueryParams)
					]);
			}
			return Promise.resolve(null);
		})
		.map(function(complexResult){

			if(!complexResult){
				return Promise.resolve(null);
			}
			aggregation_obj = complexResult[0];
			aggregation_result = complexResult[1];

			resultData["data"][aggregation_obj.getQueryField()] = aggregation_result;
		})
		.then(function(){

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
