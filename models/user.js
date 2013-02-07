/*
 * User Model
 */
var sha1 = require('sha1');

module.exports = function(mongoose){

  var schema = mongoose.Schema({
    name: {
      first: String,
      last: String
    },
    email: String,
    password: String,
    reg_date: {
      type: Date,
      default: Date.now
    }
  });

  schema.statics.signUp = function(userInfo, callback){
    userInfo.password = sha1(userInfo.password);
    this.find({email: userInfo.email}, function(err, users){
      if(err){
        // todo
      }
      if(users.length === 0){
        var User = new model(userInfo);
        User.save();
        callback({
          err: 0,
          userInfo: User
        });
      }else{
        callback({
          err: 1,
          info: 'The email is already registered.'
        });
      }
    });
  };

  schema.statics.logIn = function(userInfo, callback){
    userInfo.password = sha1(userInfo.password);
    this.find(userInfo, function(err, users){
      if(err){
        // todo
      }
      if(users.length === 0){
        // no user found.
        callback({
          err: 1,
          info: 'Email or password is incorrect.'
        });
      }else{
        callback({
          err: 0,
          userInfo: users[0]
        });
      }
    });
  };

  var model = mongoose.model('User', schema);

  return model;
}