var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//var index = require('./routes/index');
//var users = require('./routes/users');

var app = express();

const routes = require('./config/routes');
const hbs = require('express-hbs');

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.express4({  
  defaultLayout: __dirname + '/views/layout.hbs',
  partialsDir: __dirname + '/views/partials',
  layoutsDir: __dirname + '/views/'
}));

app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({limit: '2mb', extended: true}));
//app.use(express.bodyParser({limit: '50mb'}));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

routes(app);

// app.use('/', index);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// dependency
// "web3": "1.0.0-beta.30"
