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


let currentState = new Map() //Map object with key value pair. Enforces uniqueness. Stores 1 chart value for each connection

io.on('connection', (socket) => {
  // Listens for msg object passed by the client on the channel 'chat message'
  socket.on('add', (msg) => {
    //adds a new user to the Map object
    currentState.set(socket.id, msg);
    console.log("User with socketid " +socket.id+ " username: "+ msg.username +" sent value of : " + msg.value +" to the server.");
  });

  //periodically emits the data user's slider data stored in the Map
  setInterval(function() {
    var currentDate = '[' + new Date().toUTCString() + '] ';
    //emit the broken up map in the form of an array [[key, value], [key, value]]
    socket.emit('update', [...currentState]);
    console.log("Data has been emitted on channel 'update' to user with socketid: " + socket.id + " at time: " + currentDate);
    //io.emit('connected', [...currentState]);
    //console.log("Data has been emitted to all connected sockets at time:  " +  currentDate);
  },10000);

});





io.on('connection', function(socket) {
  var user = socket.request.user;

  // Suppose this user has connected from another tab,
  // then the socket.id from current tab will be
  // different from [see *1]

  var current_socket_id = socket.id;
  var last_socket_id;
  try{
    last_socket_id = user.latest_socket_id;
    // If the user has an existing socket connection
      // from the previously opened tab,

      // Send disconnection request to the previous socket
      io.to(last_socket_id).emit('disconnect');
      // [*1] current socket.id is stored in the user
      user.latest_socket_id = socket.id;
      user.save();
  }
  catch(e){
        // [*1] current socket.id is stored in the user
      user.latest_socket_id = socket.id;
      user.save();

  }

});
