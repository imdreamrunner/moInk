var emailjs = require("emailjs");
var privateSettings = require('../private.js');
exports.send = function(message, callback){
  var server  = emailjs.server.connect({
    user: privateSettings.email_username,
    password: privateSettings.email_password,
    host: privateSettings.email_host,
    ssl: privateSettings.email_ssl
  });
  message['from'] = 'moInk Service <' + privateSettings.email_username + '>';
  console.log('Trying to send email.');
  server.send(message, function(err, message) {
    console.log('Email is sent');
    callback(err, message);
  });

};
