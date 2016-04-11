var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var genericTracker = sequelize.models.genericTracker;
var order = sequelize.models.order;
var item = sequelize.models.item;

var subBranch = sequelize.models.subBranch;
var regionalBranch = sequelize.models.regionalBranch;

var itemLogic = require("../logics/itemLogic");
var orderLogic = require("../logics/orderLogic");
var RouteLogic = require("../logics/branchRouteLogic");

var Promise = require("bluebird");

order.hook("");
