const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const morgan = require('morgan');

const config = require('./config/config.js');
const env = process.env.NODE_ENV || 'development';

const mongoose = require('mongoose').connect(config.dbURL);
const ConnectMongo = require('connect-mongo')(session);

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
require('./auth/passportAuth')(passport, LocalStrategy, config, mongoose);

let rooms = [];

app.use(morgan('dev'));  // log every request to the console
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser());


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

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.set('port', process.env.PORT || 3000);
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

require('./routes/routes')(express, app, passport, config);
require('./socket/socket')(io, rooms);



server.listen(app.get('port'), () => {
  console.log('ChatRoom on Port: ' + app.get('port'));
});

