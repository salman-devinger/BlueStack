const mdlAppList = require('../models/mdlAppList');
const klass = require('klass');
const _ = require('underscore');
let MongoClient = require('mongodb').MongoClient;
MongoClient.Promise = global.Promise;

module.exports = klass({
  
  initialize: function() {

  this.appListModal =  new mdlAppList();
  
  },


  /*GET Create App List Page*/
  get: function(req, res, next) {
    let actCat = req.query.listType || 'topselling_free';
    this.appListModal.getListNames((err, result) =>{
      if (err) throw err;
      let newList = [];
      _.each(result, (itm, idx) => {
          itm.ACTIVE_YN = false;
          newList.push(itm);
      });
      const objIndex = newList.findIndex((obj => obj.listId == actCat));
      newList[objIndex].ACTIVE_YN = true;
      this.appListModal.getAppListData(actCat, (errChild, resultChild) =>{
        if (errChild) throw errChild;
        res.render('vwAppList', { title: 'BlueStack', listTypes: newList,
            username: req.query.name, res: resultChild
        });
      });
    }); 
  },

  // Get details of passed package name
  getAppDetails: function(req, res, next){
    let pkg = req.query.pkg;
    if(!pkg) res.status(200).send('Package Not Found');
    
    this.appListModal.getAppData(pkg, (errApp, resApp) =>{
      if (errApp) throw errApp;
        res.render('vwAppDetail', { title: 'BlueStack', appData : resApp[0]});
    });
  },
  reScrapRecords: function(req, res, next){
    let inActItm = [], newItm = [], actCat = 'ALL', insParams={}, updParams={};
    this.appListModal.getApiDataAll((errApi, resultApi)=>{
      if (errApi) throw errApi;
      //console.log(resultApi);
      this.appListModal.getAppListData(actCat, (errChild, resultDb) =>{
        if (errChild) throw errChild;
        res.redirect('/Applist'); // load the index.js file

        if(resultDb && resultDb.length == 0){
          // insert api json
          insParams.tbl='appStore', insParams.app_list=resultApi;
          this.appListModal.insertMongoDBData(insParams, (errIns, resIns) =>{
            if (errIns) throw errIns;
            console.log(resIns);
          });
        }
        else {
          
          // New added List
          _.each(resultApi, (itm, idx) => {
            const objIndex = resultDb.findIndex((obj => obj.package_name == itm.package_name));
            //objIndex == -1 ? newItm.push(itm) : null;
            if(objIndex == -1){
              newItm.push(itm);
            }
          });

          // Delete List
          _.each(resultDb, (itm, idx) => {
            const objIndex = resultApi.findIndex((obj => obj.package_name == itm.package_name));
            //objIndex == -1 ? inActItm.push(resultDb.package_name) : null;
            if(objIndex == -1){
              inActItm.push(itm.package_name);
            }

          });

          insParams.tbl='appStore', insParams.app_list=newItm,
          updParams.tbl='appStore', updParams.arr = inActItm;

          if(newItm && newItm.length > 0){
            this.appListModal.insertMongoDBData(insParams, (errIns, resIns) =>{
              if (errIns) throw errIns;
              console.log(resIns);
            });
          }
          if(inActItm && inActItm.length > 0){
            console.log('Insides', updParams);
            this.appListModal.updateMongoDBData(updParams, (errUpd, resUpd) =>{
              if (errUpd) throw errUpd;
              console.log(resUpd);
            });
          }
        }
        
      });

    });
    
  }
  
});
