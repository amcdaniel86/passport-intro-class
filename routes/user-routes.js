// routes/auth-routes.js
const express = require("express");
const authRoutes = express.Router();

// User model
const User = require("../models/User");
// import the model


// Bcrypt to encrypt passwords
const bcrypt = require("bcryptjs");
const bcryptSalt = 10;

// require passport routes
const passport = require("passport");




authRoutes.get("/signup", (req, res, next) => {
  res.render("auth/signup");
  // renders the signup page.
});

authRoutes.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }
// cache is the same as the signup, checking if statement for the password/username.


  User.findOne({ username })
  .then(user => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    User.create({
          username: username,
          password: hashPass
    })
    // same as without passport

    .then(()=>{
        res.redirect('/login');
    })
    .catch((err)=>{
      next(err);
    })
  });


  authRoutes.get('/login', (req, res, next)=>{

      res.render('auth/login', {"message": req.flash("error") })
  })

  authRoutes.post('/login', passport.authenticate ("local", {
    // passport.authenticate ("local", is used for passport. DO NOT USE REQ, RES, NEXT HERE)
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true
}));
// passport is preconfigured to work with many existing modules. thus passport is good to use. prewritten/pre configured to create the req.flash error when the thing doesn't work.

authRoutes.get('/logout', (req, res, next)=>{
  req.logout();
  res.redirect('/login');
})

});
module.exports = authRoutes;