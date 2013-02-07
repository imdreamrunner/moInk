module.exports = function(){
  var mongoose = require('mongoose');
  mongoose.connect('localhost', 'moink');
  return mongoose;
}