var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var passport = require('passport');
var passportLocal = require('passport-local');
var Auth = require('./logics/authentication/auth');
var redis = require('redis');
var redisStore = require('connect-redis')(expressSession);

var DB = require('./models/index');
var sequelize = DB.sequelize;
var hookedModels = require('./hooks/index');

sequelize.sync();

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var cors = require('cors');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(cookieParser());

//session saving
// app.use(expressSession({
//     secret: process.env.SESSION_SECRET || 'secret',
//     // store: new redisStore({ host: 'localhost', port: 6379, client: redisClient }),
//     saveUninitialized: false, // don't create session until something stored,
//     resave: false
//     // cookie: { maxAge: 60*60000 }
// }));

//app.use(passport.initialize());
//app.use(passport.session());

//passport initialization
Auth.setup(passport);

app.use(express.static(path.join(__dirname, 'public')));

// //Use express-flash to flash message
// app.use(require('express-flash'));

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

var subBranchResource = epilogue.resource({
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
