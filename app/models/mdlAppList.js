var klass = require('klass');

module.exports = klass({
    initialize: function() {},

    getData: function(dbConnPool, cb) {
        var queryString = 'SELECT * FROM REF_MEDIA_OUTLET ORDER BY NAME';
        console.log(queryString);
        return cb("All Done")
    }
});
