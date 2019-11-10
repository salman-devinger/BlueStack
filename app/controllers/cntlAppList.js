const mdlAppList = require('../models/mdlAppList');
const klass = require('klass');
const _ = require('underscore');
const axios = require('axios');
const Async = require('async');
let MongoClient = require('mongodb').MongoClient;
MongoClient.Promise = global.Promise;

const conUrl = 'mongodb+srv://salman:salman123@clustersalman-rcmqr.mongodb.net/admin'
const apiUrl = 'https://data.42matters.com/api/v2.0/android/apps/top_google_charts.json';
const token = '60cb438dcdf4647802e2e7bfb315edec9d614cf2';


module.exports = klass({
  
  initialize: function() {

  this.appListModal =  new mdlAppList();
  
  },


  /*GET Create User Page*/
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
  getAppDetails: function(req, res, next){
    let pkg = req.query.pkg;
    if(!pkg) res.status(200).send('Package Not Found');
    
    this.appListModal.getAppData(pkg, (errApp, resApp) =>{
      if (errApp) throw errApp;
      console.log(resApp[0])
      res.render('vwAppDetail', { title: 'BlueStack', appData : resApp[0]
      });
    });
  },
  reScrapRecords: function(req, res, next){
    let inActItm = [], newItm = [], actCat = 'ALL', insParams={}, updParams={};
    this.getApiDataAll((errApi, resultApi)=>{
      if (errApi) throw errApi;
      //console.log(resultApi);
      this.appListModal.getAppListData(actCat, (errChild, resultDb) =>{
        if (errChild) throw errChild;
        res.render('vwAppList', { title: 'BlueStack'
        });

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
    
  },
  getApiDataAll: function(cb){
    
    this.appListModal.getListNames((err, listNames) =>{
      if (err) throw err;
      let resAll = [];
      console.log(listNames);
      Async.eachSeries(listNames, function (item, callback) {
        let callUrl = apiUrl+'?access_token='+token+'&list_name='+item.listId;
        console.log(callUrl);
        axios.get(callUrl)
        .then(function (response) {
          let dt = response.data;
          console.log(dt.list_name);
          //tmpObj[item.listId] = dt.app_list;
          _.each(dt.app_list, (itm, idx) => {
            let tmpObj = {};
            tmpObj.ACTIVE_YN = 'Y',
            tmpObj.listType = item.listId,

            tmpObj.package_name = itm.package_name,
            tmpObj.description = itm.description,
            tmpObj.short_desc = itm.short_desc,
            tmpObj.price = itm.price,
            tmpObj.category = itm.category,
            tmpObj.title = itm.title,
            tmpObj.downloads_max = itm.downloads_max,
            tmpObj.version = itm.version,
            tmpObj.created = itm.created,
            tmpObj.contains_ads = itm.contains_ads,
            tmpObj.size = (itm.size/1000000).toFixed(2),
            tmpObj.market_source = itm.market_source,
            tmpObj.icon = itm.icon,
            tmpObj.market_status = itm.market_status,
            tmpObj.developer = itm.developer,
            tmpObj.screenshots = itm.screenshots,
            tmpObj.promo_video = itm.promo_video,
            tmpObj.website = itm.website,
            tmpObj.rating = (itm.rating).toFixed(1);
            resAll.push(tmpObj);
          });
          //resAll.push(tmpObj);
          console.log(item.listId);
          return callback(null, 'Done');
        })
        .catch(function (error) {
          // handle error
          console.error(error);
          throw error;
        });
      }, function (err) {
          if(err){
              throw err;
          }
          return cb(null, resAll);
      });
    
    });
    
  }
});
