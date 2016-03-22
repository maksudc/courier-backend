var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var DB = require('./models/index');
var sequelize = DB.sequelize;
sequelize.sync();

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var cors = require('cors');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var epilogue = require("epilogue");

epilogue.initialize({
    app: app,
    sequelize: sequelize
});

var regionResource = epilogue.resource({
    model: sequelize.models.region,
    endpoints:["/regions" , "/regions/:id"],
});

var regionalBranchResource = epilogue.resource({
    model: sequelize.models.regionalBranch,
    endpoints:["/regionalBranches" , "/regionalBranches/:id"],
});

var regionalBranchResource = epilogue.resource({
    model: sequelize.models.subBranch,
    endpoints:["/subBranches" , "/subBranches/:id"],
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}else{

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

}

//app.use(regionResource.controllers);

//app.use(regionResource.use);
//regionResource.use(app.routes);

module.exports = app;
