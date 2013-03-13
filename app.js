var express = require('express');
var http = require('http');
var path = require('path');
var ObjectId = require('mongoose').Types.ObjectId;

var MongoStore = require('connect-mongo')(express);

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session({
    secret: 'another secret',
    store: new MongoStore({
      db: 'moink'
    })
  }));
  app.use(app.router);
  app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/designer', require('less-middleware')({ src: path.join(__dirname, 'designer') }));
  app.use('/designer', express.static(path.join(__dirname, 'designer')));
  app.use('/designs', express.static(path.join(__dirname, 'designs')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var mongoose = require('./db')();
var models = require('./models')(mongoose);
require('./controllers')(app, models);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
