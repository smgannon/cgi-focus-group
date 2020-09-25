//Adam Notes:
//'app' is an instance of Express
//http://expressjs.com/en/starter/basic-routing.html     --Express documentation
//https://socket.io/get-started/chat/         --Socket IO documentation
//NPM is dependency manager
//javascript is language. NodeJS allows it to be server side. 
//Express is the web application framework/server
//Socket IO allows for easy realtime data communications
//https://www.digitalocean.com/community/tutorials/nodejs-express-basics        --Middleware explained, app.use is middleware, have access to each HTTP request brought into the server
//http://expressjs.com/en/guide/writing-middleware.html  --MiddleWare explained in more detail
//Middleware is basically the 'Controller' Layer? Response objects and requests can be accessed and modified here  
//Can we use MVC here? https://github.com/expressjs/express/tree/master/examples/mvc
//Express Examples http://expressjs.com/en/starter/examples.html

//req: request
//res: response  http://expressjs.com/en/guide/routing.html  (list of response methods; example, resp.render renders a view)
//next: go to the next method

//Use the express.Router class to create modular, mountable route handlers. 
//A Router instance is a complete middleware and routing system; for this reason, it is often referred to as a “mini-app”.

//add canvas.js to Public JS files for client side
//https://www.youtube.com/watch?v=BUkqyjXgfDg explanation of CanvasJS chart which accepts real time updates

//https://stackoverflow.com/questions/56417490/update-a-chart-dynamically-with-socket-io-in-real-time  push data to chart using socketio

//Jade vs HTML

//https://www.w3schools.com/howto/howto_js_rangeslider.asp  input slider

//https://socket.io/get-started/chat/
//https://socket.io/docs/





var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//TODO: import new Routes here
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

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = {app: app, server: server};


// const chartArray = [1];
// //Listens for a socket named 'connection'
// io.on('connection', (socket) => {
//     //listens for data to be passed through a communication on the socket named 'add'
//     socket.on('add', (data) => {
//         //pushes that data passed onto the chart array
//         chartArray.push(data);
//     }); 
//     //sends the chart array to the socket channel named 'update' every 25 seconds
//     setInterval(function() {
//         socket.emit('update', chartArray);
//     },1000/25);
// });



// Store the imported class here
// var user = require('./User');
// var userArray = [];
// userArray.push(new User(1, 5));
// console.log("Test");




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
    socket.emit('update', currentState);
  },10000);

});



//currentState.get(socket.id)