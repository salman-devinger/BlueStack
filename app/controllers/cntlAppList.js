var mdlAppList = require('../models/mdlAppList');
var klass = require('klass');
var _ = require('underscore');

module.exports = klass({
  
  initialize: function() {

  this.appListModal =  new mdlAppList();
  
  },


  /*GET Create User Page*/
  get: function(req, res, next) { 
       	
    res.render('vwAppList', { title: 'AdVant Promo', dbResultset: 'salman', 
      username: req.name
    });
         
  }
});
