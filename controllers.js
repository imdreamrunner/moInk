/*
 * Read all files in routes folder
 * Idea is from https://github.com/dtryon/clog
 */
var fs = require('fs');

module.exports = function(app, models){
  fs.readdir(__dirname + "/controllers", function(err, files){
    if (err) throw err;
    files.forEach(function(file){
      var name = file;
      if(name.split('.').pop() === 'js'){
        // This is to avoid reaing files like .DS_Store
        name = file.replace('.js', '');
        console.log('Controller ' + name + ' is loaded.')
        require('./controllers/' + name)(app, models);
      }
    });
  });
};