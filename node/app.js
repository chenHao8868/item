var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var users = require('./routes/users.js');

var proxy = require('express-http-proxy');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//响应mock请求，交由中间件转发
//配置
let opts = {
  preserveHostHdr: true,
  reqAsBuffer: true,
  //转发之前触发该方法
  proxyReqPathResolver: function(req, res) {
      //这个代理会把匹配到的url（下面的 ‘/api’等）去掉，转发过去直接404，这里手动加回来，
      req.url = req.baseUrl+req.url;
      return require('url').parse(req.url).path;
  },
}
app.use('/api',proxy('http://localhost:3333',opts));

app.use('/', indexRouter);
app.use('/userss', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
