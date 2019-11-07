'use strict';

process.setMaxListeners(0);
var app = require('./app');
//var port = process.env.NODE_PORT;
var port = 3000;
app.listen(port, function (err) {
	if (err) console.error('Error while starting the app:', err);
	else {
		console.log('Web App listening at port ' + port + '.')
	};
}).setTimeout(app.get('timeout') + 5000);