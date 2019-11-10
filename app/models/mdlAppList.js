var klass = require('klass');
const MongoClient = require('mongodb').MongoClient;
//MongoClient.Promise = global.Promise;
const conUrl = 'mongodb+srv://salman:salman123@clustersalman-rcmqr.mongodb.net/admin'
const selectedDB = 'BlueStack';
module.exports = klass({
    initialize: function() {
        this.MongoClient = MongoClient;

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
    }
});
