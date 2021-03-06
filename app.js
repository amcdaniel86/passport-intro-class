require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');

const session = require("express-session");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
// required for Passport module usage
// 3rd party at top
const flash = require('connect-flash');


const User      = require('./models/User');


mongoose
  .connect('mongodb://localhost/passport-intro-class', {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';


// Passport configuration stuff below
passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});


// activate the flash messages package
// flash exists outside the route, consollogging it
// try to login, doesn't work, 'save the string to req.flash, req.flash 
app.use(flash());





passport.use(new LocalStrategy((username, password, next) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: "Incorrect username" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect password" });
    }

    return next(null, user);
  });
}));

// above, null flash message thing relates to all the flash messages that appear in the app.



// activates the session below
app.use(session({
  secret: "our-passport-local-strategy-app",
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
// link, make the session in passport


const index = require('./routes/index');
app.use('/', index);

app.use('/', require('./routes/user-routes'));


module.exports = app;


// Strategy - Defines which strategy we are going to use, and its configuration, that includes error control.
// User serialize and User deserialize - It helps to keep the amount of data in the session as small as we need. In this case, these functions will define which data is kept in the session, and how to recover this information from the database.

// serialize: user in the session, req.user, passport has req.user, everytime, req.user is RandomSource, serialize is written to session and deserialize is read thing in the session.

// localstrategy is for login page.