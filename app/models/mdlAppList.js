var klass = require('klass');
const MongoClient = require('mongodb').MongoClient;
//MongoClient.Promise = global.Promise;
const axios = require('axios');
const Async = require('async');
const _ = require('underscore');
const conUrl = 'mongodb+srv://salman:salman123@clustersalman-rcmqr.mongodb.net/admin'
const selectedDB = 'BlueStack';
const apiUrl = 'https://data.42matters.com/api/v2.0/android/apps/top_google_charts.json';
const token = '60cb438dcdf4647802e2e7bfb315edec9d614cf2';

module.exports = klass({
    initialize: function() {

    },

    getListNames: function(cb) {
        let params = {};
        params.tbl = 'listType',
        params.query = {};
        this.getMongoDBData(params, (err, res) => {
            if (err) throw err;
            return cb(null, res);
        });

    },
    getAppList: function(cb) {
        this.getListNames((err, result) =>{
            if (err) throw err;
            let appArr =[];
            Async.eachSeries(result, (itm, callback) => {
                let tmpObj = {};
                const 
                    tbl = 'appStore',
                    query = {'listType' : itm.listId };
                MongoClient.connect(conUrl,(err, db) =>{
                    if (err) throw err;
                    let dbo = db.db(selectedDB);
                    dbo.collection(tbl).find(query).limit(3).toArray((errChild, resChild) => {
                        if (errChild) throw errChild;
                        db.close();
                        tmpObj['listId'] = itm.listId;
                        tmpObj['listName'] = itm.listName;
                        tmpObj['data'] = resChild;
                        appArr.push(tmpObj);
                        return callback(null, 'done');
                    });
                });
            }, function (err) {
                if(err){
                    throw err;
                }
                console.log(appArr);
                return cb(null, appArr);
            });
        }); 
    },
    getAppListData: function(actCat, cb) {
        let params = {};
        params.tbl = 'appStore',
        params.query = actCat == 'ALL' ? { 'ACTIVE_YN' : 'Y'} : { $and : [{'ACTIVE_YN' : 'Y'},{'listType' : actCat}]  } ;
        this.getMongoDBData(params, (err, res) =>{
            if (err) throw err;
            return cb(null, res);
        });
    },
    getAppData: function(ip_pkg, cb) {
        let params = {};
        params.tbl = 'appStore',
        params.query = {'package_name' : ip_pkg };
        this.getMongoDBData(params, (err, res) =>{
            if (err) throw err;
            return cb(null, res);
        });
    },
    getMongoDBData: function(params, cb) {
        const 
            tbl = params.tbl,
            query = params.query;
        MongoClient.connect(conUrl,(err, db) =>{
            if (err) throw err;
            let dbo = db.db(selectedDB);
            dbo.collection(tbl).find(query).toArray((err, result) => {
                if (err) throw err;
                db.close();
                console.log("DB Con Sucesfull");
                return cb(null, result); 
            });
        });
    },
    insertMongoDBData: function(params, cb) {
        const 
            tbl = params.tbl,
            myobj = params.app_list
        
        MongoClient.connect(conUrl,(err, db) =>{
            if (err) throw err;
            let dbo = db.db(selectedDB);
            dbo.collection(tbl).insertMany(myobj, (err, res) => {
                if (err) throw err;
                console.log("Number of documents inserted: " + res.insertedCount);
                db.close();
                return cb(null, "Number of documents inserted: " + res.insertedCount); 
            });
        });
    },
    updateMongoDBData: function(params, cb) {
        const 
            tbl = params.tbl,
            updArr = params.arr;
        
        MongoClient.connect(conUrl,(err, db) =>{
            if (err) throw err;
            let dbo = db.db(selectedDB);
            //dbo.collection(tbl).updateMany(query, updateValue, function(err, res) {
            dbo.collection(tbl).updateMany({ package_name: {$in: updArr }}, {$set: {ACTIVE_YN: "N"} }, function(err, res) {
                if (err) throw err;
                console.log(res.result.nModified + " document(s) updated");
                db.close();
                return cb(null, res.result.nModified + " document(s) updated"); 
            });
        });
    },

    getApiDataAll: function(cb){
    
        this.getListNames((err, listNames) =>{
          if (err) throw err;
          let resAll = [];
          console.log(listNames);
          Async.eachSeries(listNames, (item, callback) => {
            let callUrl = apiUrl+'?access_token='+token+'&list_name='+item.listId+'&app_country=IN';
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
