var ObjectId = require('mongoose').Types.ObjectId;
var path = require('path');

module.exports = function(app, models){
  app.get('/attachments/images/:filename', function(req, res){
    var fs = require('fs');
    var Canvas = require('canvas');

    var ATTACHMENT_DIR =  path.join(__dirname, '../attachments/images/');

    console.log(ATTACHMENT_DIR + req.params.filename);

    var img = new Canvas.Image;
    img.onerror = function(err){
      var canvas = new Canvas(120, 20);
      var ctx = canvas.getContext('2d');
      ctx.font = '15px Arial';
      ctx.fillText("Image not found.", 0, 15);
      responseImage(canvas);
    };
    img.onload = function(){
      var canvas = new Canvas(img.width, img.height);
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, img.width, img.height);
      responseImage(canvas);
    };
    var responseImage = function(canvas){
      res.writeHead(200, { 'Content-Type': 'image/png' } );
      canvas.toBuffer(function(err, buf){
        res.end(buf);
      });
    };
    img.src = ATTACHMENT_DIR + req.params.filename;
  });
};