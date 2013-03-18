/*
 * User Model
 */
var sha1 = require('sha1');
var random = require('../utilities/random.js');

module.exports = function(mongoose){

  var schema = mongoose.Schema({
    name: {
      first: String,
      last: String
    },
    email: String,
    password: String,
    salt: String,
    reg_date: {
      type: Date,
      default: Date.now
    }
  });

  schema.statics.signUp = function(userInfo, callback){
    userInfo.salt = random.randomString(6);
    userInfo.password = sha1(userInfo.password + userInfo.salt);
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
          msg: 'The email is already registered.'
        });
      }
    });
  };

  schema.statics.logIn = function(userInfo, callback){
    this.find({email: userInfo.email}, function(err, users){
      if(err){
        // todo
      }
      if(users.length === 0){
        // no user found.
        callback({
          err: 1,
          msg: 'Email is not registered.'
        });
      }else{
        if(users[0].password == sha1(userInfo.password + (users[0].salt || ''))){
          callback({
            err: 0,
            userInfo: users[0]
          });
        }else{
          callback({
            err: 2,
            msg: 'Password is incorrect.'
          });
        }
      }
    });
  };

  var model = mongoose.model('User', schema);

  return model;
}