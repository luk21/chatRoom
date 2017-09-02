const bcrypt = require('bcrypt-nodejs');

module.exports = (passport, LocalStrategy, config, mongoose) => {

  const userSchema = new mongoose.Schema({
    username: String,
    password: String
  });

  // methods
  // generating a hash
  userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null) ;
  };

  // checking if password is valid
  userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };


  const User = mongoose.model('User', userSchema);

  passport.serializeUser((user, done) => {
    done(null, user.id)
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    })
  });

  passport.use('signup', new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true // allows us to pass back the entire request to the callback
  }, (req, username, password, done) => {

    process.nextTick(() => {
      User.findOne({'username': username }, (err, user) => {
        if(err)
          return done(err);

        if(user) {
          return done(null, false, req.flash('signupMessage', 'That username is already in use'));
        } else {
          let newUser = new User();

          newUser.username = username;
          newUser.password = newUser.generateHash(password);

          newUser.save((err) => {
            if (err)
              throw err;
            return done(null, newUser);
          })
        }
      })
    });
  }));

  passport.use('login', new LocalStrategy({
    usernameField: "username",
    passwordFiled: "password",
    passReqToCallback: true
  }, (req, username, password, done) => {

    console.log(username, password);

    User.findOne({'username': username}, (err, user) => {

      if(err)
        return done(err);

      if (!user)
        return done(null, false, req.flash('loginMessage', 'No user found'));

      if (!user.validPassword(password))
        return done(null, false, req.flash('loginMessage', 'Wrong password'));

      //  all is well, return successful user
      return done(null, user);
    });
  }));

};