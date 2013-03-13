module.exports = function(app, models){
  app.get('/', function(req, res){
    res.render('home/index', {
      title: 'designer'
    });
  });

  app.get('/explore', function(req, res){
    res.render('home/explore');
  });

  app.get('/about', function(req, res){
    res.render('home/about');
  });
}