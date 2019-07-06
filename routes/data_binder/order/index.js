var express = require('express');
var router = express.Router();

var stashViewDataBinder = require("./viewStash");
router.use('/stash/view', stashViewDataBinder);

var draftViewDataBinder = require("./viewDraft");
router.use('/draft/view' , draftViewDataBinder);

var deliverableDataBinder = require("./viewDeliverable");
router.use('/deliverable/view' , deliverableDataBinder);

var deliveredDataBinder = require("./viewDelivered");
router.use('/delivered/view' , deliveredDataBinder);

var receivedDataBinder = require("./viewReceived");
router.use('/received/view' , receivedDataBinder);

var incomingDataBinder = require("./viewIncoming");
router.use('/incoming/view' , incomingDataBinder);

var awaitingDataBinder = require("./viewAwaiting");
router.use('/awaiting/view' , awaitingDataBinder);

var trackerDataBinder = require("./viewTracking");
router.use("/tracking/view" , trackerDataBinder);

var printTrackerItemLogs=require("./viewMultiplePrintedItems");
router.use("/printTrackerItemLogs",printTrackerItemLogs);

var printTrackerOrderLogs=require("./viewMultiplePrintedOrders");
router.use("/printTrackerOrderLogs",printTrackerOrderLogs);

var printTrackerOrderLogsOrderwise=require("./multiplePrintedOrdersOrderwise");
router.use("/printTrackerOrderLogsOrderwise",printTrackerOrderLogsOrderwise);

module.exports = router;
