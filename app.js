var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var chartRouter = require('./routes/chart');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(function(req, res, next){
  res.io = io;
  next();
})
app.use(express.static(path.join(__dirname, 'public')));

//TODO: add new Routes here
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/chart', chartRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = {app: app, server: server};


let currentState = new Map() //Map object with key value pair

io.on('connection', (socket) => {
  // Listens for msg object passed by the client on the channel 'chat message'
  socket.on('add', (msg) => {
    //adds a new user to the Map object
    currentState.set(socket.id, msg);
    console.log("User with socketid " +socket.id+ " username: "+ msg.userName +" sent value of : " + msg.value +" to the server.");
  });

  //periodically emits an array of the objects stored in the Map
  setInterval(function() {
    socket.emit('update', [...currentState]);
  },10000);

});
