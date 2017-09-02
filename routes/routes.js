module.exports = (express, app, passport) => {
  const router = express.Router();

  router.get('/', (req, res, next) => {
    res.render('index', {title: "ChatRoom"})
  });

  app.get('/login', (req, res) => {
    res.render('login', {title: "Login", message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('login', {
    successRedirect: '/chatrooms',
    failureRedirect: '/chatrooms',
    failureFlash: true
  }));

  app.get('/signup', (req, res) => {
    res.render('signup', {title: "Signup", message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('signup', {
      successRedirect: '/chatrooms',
      failureRedirect: '/signup',
      failureFlash: true // allow flash messages
  }));


  function securePages(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    res.redirect('/');
  }

  router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
  });

  router.get('/chatrooms', securePages, (req, res, next) => {
    res.render('chatrooms', {title: "Chatrooms", user: req.user});
  });

  app.use('/', router);

};