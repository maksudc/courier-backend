var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var ShipmentModel = sequelize.models.shipment;
var RouteLogic = require("../logics/branchRouteLogic");
var genericTracker = sequelize.models.genericTracker;
var trackerLog = sequelize.models.trackerLog;

var moment = require("moment");

genericTracker.hook("afterCreate" , function(trackerInstance , options){

  var trackerLogData = {};
  trackerLogData.action = "created";
  trackerLogData.trackerId = trackerInstance.uuid;
  trackerLogData.branchType = trackerInstance.sourceBranchType;
  trackerLogData.branchId = trackerInstance.sourceBranchId;

  var eventDateTime = moment.utc();
  trackerLogData.eventDateTime = eventDateTime;
  trackerLogData.createdAt = eventDateTime;
  trackerLogData.updatedAt = eventDateTime;

  return trackerLog
  .create(trackerLogData, {
    transaction: options.transaction
  });
});

genericTracker.hook("beforeDestroy", function(trackerInstance, options){

    return trackerLog.destroy({
      where: {
        trackerId: trackerInstance.uuid
      },
      transaction: options.transaction
    });
});
