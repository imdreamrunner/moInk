var sha1 = require('sha1');
var ObjectId = require('mongoose').Types.ObjectId;
var email = require('../utilities/email.js');
var check = require('validator').check;

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
    req.assert('email', 'Invalid email').isEmail();
    if (req.validationErrors()){
      res.json({
        err: 2,
        msg: 'Invalid email'
      });
      return;
    }
    if (!req.body.firstName || req.body.firstName == ''
      || !req.body.lastName || req.body.lastName == ''
      || !req.body.email || req.body.email == ''
      || !req.body.password || req.body.password == '') {
      res.json({
        err: 1,
        msg: 'All fields are required.'
      });
      return;
    }

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
    res.render('user/login', {
      msg: req.query.msg || '',
      redirect: req.query.redirect || '/'
    });
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
      if(result.err){
        res.json(result);
      }else{
        var currentUser = result.userInfo;
        delete currentUser.password; // There is no need to store user's password in session.
        delete currentUser.salt;
        req.session.user = currentUser;
        res.json(result);
      }
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
   * User settings page
   */
  app.get('/user/settings', function(req, res){
    res.render('user/settings', {
      userInfo: req.session.user
    });
  });

  /*
   * User settings page
   */
  app.post('/user/settings', function(req, res){
    models.user.find({_id: new ObjectId(req.body.id)}).exec(function (err, users) {
      if (!users[0]) {
        res.json({
          err: 1,
          msg: 'User not found.'
        });
        return;
      }
      var currentUser = users[0];
      if (currentUser._id.toString() !== req.session.user._id.toString()) {
        res.json({
          err: 2,
          msg: 'Permission denied.'
        });
        return;
      }
      if (req.body.password && req.body.password != '') {
        currentUser.password = sha1(req.body.password + (currentUser.salt || ''));
      }
      currentUser.name.first = req.body.firstName;
      currentUser.name.last = req.body.lastName;

      currentUser.save(function () {
        delete currentUser.password;
        delete currentUser.salt;
        req.session.user = currentUser;
        res.json({
          err: 0
        });
      });
    });
  });

  /*
   * User logout
   */
  app.get('/user/logout', function(req, res){
    delete req.session.user;
    res.redirect('/');
  });

  /*
   * User settings page
   */
  app.get('/user/forget-password', function(req, res){
    res.render('user/forget-password');
  });

  /*
   * User request reset password
   */
  app.post('/user/request-reset-password', function(req, res){
    models.user.find({email: req.body.email}).exec(function (error,users) {
      if (!users[0]) {
        res.json({
          err: 1,
          msg: 'Email not found.'
        });
        return;
      }
      var user = users[0];
      email.send({
        text: 'Please visit the link below to reset your password: \n' +
          '/user/reset-password?id=' + user._id + '&key=' + user.password,
        to: user.name.first + ' ' + user.name.last + ' <' + user.email + '>',
        subject: "Reset password in moink.me"
      }, function () {
        res.json({
          err: 0,
          msg: 'Email is sent.'
        })
      });
    });
  });

  /*
   * Reset password page
   */
  app.get('/user/reset-password', function(req, res){
    res.render('user/reset-password', {
      id: req.query.id,
      key: req.query.key
    });
  });

  /*
   * Reset password
   */
  app.post('/user/reset-password', function(req, res){
    if (!req.body.password || req.body.password == '') {
      res.json({
        err: 2,
        msg: 'Password cannot bu null.'
      });
      return;
    }
    models.user.find({_id: new ObjectId(req.body.id)}).exec(function (err, users){
      if (!users[0]) {
        res.json({
          err: 1,
          msg: 'No record found.'
        });
        return;
      }
      var currentUser = users[0];
      if (currentUser.password !== (req.body.key || '')) {
        res.json({
          err: 3,
          msg: 'Permission denied.'
        });
        return;
      }
      currentUser.password = sha1(req.body.password + (currentUser.salt || ''));
      currentUser.save(function () {
        res.json({
          err: 0
        });
      });
    });
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
      res.redirect('/user/login?msg=require-login&redirect=' + encodeURIComponent(req.url));
    }
  };

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
  });

  app.post('/user/delete', function (req, res) {
    console.log(req.body.id);
    models.design.find({_id: new ObjectId(req.body.id)}).exec(function (err, designs) {
      if (designs[0]) {
        var design = designs[0];
        design.content = req.body.content;
        design.settings = req.body.settings;
        design.remove(function () {
          res.json({
            err: 0
          });
        });
      }
    });
  });
};