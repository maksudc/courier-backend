var express = require('express');
var router = express.Router();

var stashViewDataBinder = require("./viewStash");
router.use('/stash/view', stashViewDataBinder);

var draftViewDataBinder = require("./viewDraft");
router.use('/draft/view' , draftViewDataBinder);

var deliverableDataBinder = require("./viewDeliverable");
router.use('/deliverable/view' , deliverableDataBinder);

module.exports = router;
