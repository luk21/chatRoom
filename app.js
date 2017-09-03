const express = require('express');
const app = express();

const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const morgan = require('morgan');
const flash = require('connect-flash');

const config = require('./config/config.js');
const env = process.env.NODE_ENV || 'development';

const mongoose = require('mongoose').connect(config.dbURL);
const ConnectMongo = require('connect-mongo')(session);

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
require('./auth/passportAuth')(passport, LocalStrategy, config, mongoose);

let rooms = [];

app.use(morgan('dev'));  // log every request to the console
// setup view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
// static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser()); // parse req


if(env === 'development') {
  // dev specific setting
  app.use(session({secret: config.sessionSecret, saveUninitialized: true, resave: true}));
} else {
  // prod specific setting
  app.use(session({
    secret: config.sessionSecret,
    store: new ConnectMongo({
      url: config.dbURL,
      mongoose_connection: mongoose.connection,
      stringify: true
    })
  }));
}
// passport middleware
app.use(passport.initialize());
app.use(passport.session());
// flash messages stored in session
app.use(flash());


app.set('port', process.env.PORT || 3000);
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

require('./routes/routes')(express, app, passport, config, rooms);
require('./socket/socket')(io, rooms);


server.listen(app.get('port'), () => {
  console.log('ChatRoom on Port: ' + app.get('port'));
});

