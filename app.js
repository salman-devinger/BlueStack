'use strict';
var express = require('express');
var appRoutes = require('./app/routes/index');
var expressHbs    = require('express-handlebars');
var hbsHelpers    = require('handlebars-helpers')();
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
let viewPath = path.join(__dirname, 'app/views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('views', viewPath);
console.log(__dirname, 'app/views');

var hbs = expressHbs.create({
	extname: 'hbs',
	layoutsDir: viewPath + '/layouts',
	partialsDir: viewPath + '/partials',
	defaultLayout: 'main.hbs',
	helpers : hbsHelpers

});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');


//app.engine('handlebars', expressHbs());
//app.set('view engine', 'handlebars');

app.use('/', express.static(__dirname + '/public'));

app.use( function(req, res, next) {

	if (req.originalUrl && req.originalUrl.split("/").pop() === 'favicon.ico') {
	  return res.sendStatus(204);
	}
  
	return next();
  
});
app.use('/', appRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	console.log(err, req.originalUrl);
	if (err.status === 404) {
		// Handle 404 error
		console.log(err, req.originalUrl);
	} 
	else {
		// Handle any other error
		console.log(err, req.originalUrl);
	}
});

module.exports = app;