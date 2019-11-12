'use strict';

var express = require('express');
var router = express.Router();
var _ = require('underscore');

var cntlAppList = require('../controllers/cntlAppList');

var appListObj = new cntlAppList();


/*GET DailyPlans Page*/
router.get('/', function(req, res) {
    res.redirect('/ApplistAll'); // load the index.js file
});
router.get('/ApplistAll/', _.bind(appListObj.get, appListObj));
router.get('/Applist/', _.bind(appListObj.getAppList, appListObj));
router.get('/ReScrap/', _.bind(appListObj.reScrapRecords, appListObj));
router.get('/appdetails/', _.bind(appListObj.getAppDetails, appListObj));

module.exports = router;