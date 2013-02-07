module.exports = function(app, models){
  /*
   * User sign up page
   */
  app.get('/user/signup', function(req, res){
    res.render('user/signup');
  });

  /*
   * User sign up response
   * method: post
   * return: json
   */
  app.post('/user/signup', function(req, res){
    var userInfo = {};
    userInfo.name = {};
    userInfo.name.first = req.body.firstName;
    userInfo.name.last = req.body.lastName;
    userInfo.email = req.body.email;
    userInfo.password = req.body.password;

    models.user.signUp(userInfo, function(result){
      res.json(result);
    });
  });

  /*
   * User login page
   */
  app.get('/user/login', function(req, res){
    console.log(req.session.user);
    res.render('user/login');
  });

  /*
   * User login response
   * method: post
   * return: json
   */
  app.post('/user/login', function(req, res){
    var userInfo = {};
    userInfo.email = req.body.email;
    userInfo.password = req.body.password;

    models.user.logIn(userInfo, function(result){
      var currentUser = result.userInfo
      delete currentUser.password; // There is no need to store user's password in session.
      req.session.user = currentUser;
      res.json(result);
    });
  });

  /*
   * Check user login status
   */
  app.get('/user/loginStatus', function(req, res){
    var userInfo = req.session.user;
    if(userInfo){
      res.json({
        isLogin: 1,
        userInfo: userInfo
      });
    }else{
      res.json({
        isLogin: 0
      });
    }
  });

  /*
   * User logout
   */
  app.get('/user/logout', function(req, res){
    delete req.session.user;
    res.redirect('/');
  });

  /*
   * RequireLogin
   * Redirect user to login page if not logged in.
   */
  var requireLogin = function(req, res, next){
    var userInfo = req.session.user;
    if(userInfo){
      next();
    }else{
      res.redirect('/user/login');
    }
  }

  /*
   * User's collection
   */
  app.get('/user/collection', requireLogin);
  app.get('/user/collection', function(req, res){
    models.design.findByUser(req.session.user._id).sort('-create_date').exec(function(err, collection){
      res.render('user/collection', {
        collection: collection,
        userInfo: req.session.user
      });
    });
  });

  app.post('/user/newDesign', requireLogin);
  app.post('/user/newDesign', function(req, res){
    var Design = new models.design({
      users: [{user_id: req.session.user._id}],
      title: req.body.title,
      type: 1
    });
    Design.save();
    res.json({
      err: 0,
      id: Design._id
    })
  })
}