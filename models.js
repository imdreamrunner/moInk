var fs = require('fs');
module.exports = function(mongoose){
  var models = {};
  fs.readdir(__dirname + "/models", function(err, files){
    if (err) throw err;
    files.forEach(function(file){
      var name = file;
      if(name.split('.').pop() === 'js'){
        // This is to avoid reaing files like .DS_Store
        name = file.replace('.js', '');
        console.log('Model ' + name + ' is loaded.')
        models[name] = require('./models/' + name)(mongoose);
      }
    });
  });
  return models;
}