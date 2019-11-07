'use strict';

var express = require('express');
var router = express.Router();
var _ = require('underscore');

var cntlAppList = require('../controllers/cntlAppList');

var appListObj = new cntlAppList();


/*GET DailyPlans Page*/
router.get('/Applist/', _.bind(appListObj.get, appListObj));

module.exports = router;