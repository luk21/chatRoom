module.exports = (express, app, passport, config, rooms) => {
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
    res.render('chatrooms', {title: "Chatrooms", user: req.user, config: config.host});
  });

  // TODO add secure pages below
  router.get('/room/:id',(req, res, next) => {
    const room_name = getRoomName(req.params.id);
    console.log(req.user);
    res.render('room', {user: req.user, room_number: req.params.id, config: config, room_name: room_name})
  });

  function getRoomName(id) {
    for (let room of rooms) {
      if(room.room_number == id) {
        return room.room_name;
      }
    }
    // throw Error("No room with given id!")
  }

  app.use('/', router);

};