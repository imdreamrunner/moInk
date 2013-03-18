var fs = require('fs');
var ObjectId = require('mongoose').Types.ObjectId;
var url = require('url');
var http = require('http');
var panel = require('../utilities/panel');
var Canvas = require('canvas');
var path = require('path');

module.exports = function (app, models) {
  app.get('/designer/:id', function (req, res) {
    models.design.find({_id: new ObjectId(req.params.id)}).exec(function (err, designs) {
      if (designs[0]) {
        res.render('designer/designer', {
          design: designs[0]
        });
      }
    });
  });

  // Todo: check whether the user own this design.

  app.post('/designer/get', function (req, res) {
    models.design.find({_id: new ObjectId(req.body.id)}).exec(function (err, designs) {
      if (designs[0]) {
        res.json({
          err: 0,
          design: designs[0]
        });
      }
    });
  });

  app.post('/designer/save', function (req, res) {
    if (!req.session.user || !req.session.user._id) {
      res.json({
        err: 1,
        msg: 'Login required.'
      });
      return;
    }
    models.design.checkPermission(req.body.id, req.session.user._id || '', function (err, design) {
      if (err) {
        res.json({
          err: err,
          msg: design
        });
      } else {
        if (req.body.content) {
          design.content = req.body.content;
        }
        if (req.body.settings) {
          design.settings = req.body.settings;
        }
        if (req.body.title) {
          design.title = req.body.title;
        }

        design.save(function () {
          res.json({
            err: 0
          });
        });
      }
    });
  });

  /* Get Image from Third Party Websites */
  app.post('/designer/image/getFromURL', function (req, res) {
    if (!req.session.user || !req.session.user._id) {
      res.json({
        err: 1,
        msg: 'Login required.'
      });
      return;
    }

    models.design.checkPermission(req.body.id, req.session.user._id || '', function (err, design) {
      if (err) {
        res.json({
          err: err,
          msg: design
        });
      } else {
        /*
         * Download method from http://www.hacksparrow.com/using-node-js-to-download-files.html
         */

        var designId = req.body.id;
        var fileURL = req.body.url;
        var DOWNLOAD_DIR = path.join(__dirname, '../attachments/' + designId + '/');

        // Check permission

        // Create attachments directory, then start download.
        require('child_process').exec('mkdir -p ' + DOWNLOAD_DIR, function(err, stdout, stderr) {
          if (err) throw err;

          fileInfo = {
            designId: designId,
            url: fileURL
          };

          models.design.addAttachment(fileInfo, function (err, attachment) {
            var attachmentId = attachment._id;
            var urlParse = url.parse(fileURL);
            var options = {
              host: urlParse.host.split(":")[0],
              port: urlParse.host.split(":")[1] || 80,
              path: urlParse.pathname
            };

            var file_name = attachmentId + '.' + urlParse.pathname.split('.').pop();
            var file = fs.createWriteStream(DOWNLOAD_DIR + file_name);

            http.get(options, function (response) {
              response.on('data',function (data) {
                file.write(data);
                console.log('write data');
              }).on('end', function () {
                  file.end();
                  console.log(DOWNLOAD_DIR + file_name);
                  res.json({
                    err: 0,
                    attachment: attachment
                  });
                });
            });
          });
        });
      }
    });
  });

  /* Upload image from user's computer. */
  app.post('/designer/image/upload', function (req, res) {
    if (!req.session.user || !req.session.user._id) {
      res.json({
        err: 1,
        msg: 'Login required.'
      });
      return;
    }

    models.design.checkPermission(req.body.id, req.session.user._id || '', function (err, design) {
      if (err) {
        res.json({
          err: err,
          msg: design
        });
      } else {
        /*
         * Modified from http://markdawson.tumblr.com/post/18359176420/asynchronous-file-uploading-using-express-and-node-js
         */

        var designId = req.body.id;
        var UPLOAD_DIR = path.join(__dirname, '../attachments/' +  designId + '/');
        var fileURL = req.files.userPhoto.name;

        // Create attachments directory.
        require('child_process').exec('mkdir -p ' + UPLOAD_DIR, function(err, stdout, stderr) {
          if (err) throw err;

          fileInfo = {
            designId: designId,
            url: 'file://' + fileURL
          };

          models.design.addAttachment(fileInfo, function (err, attachment) {
            var attachmentId = attachment._id;
            var fileName = attachmentId + '.' + req.files.userPhoto.name.split('.').pop();
            fs.rename(req.files.userPhoto.path, UPLOAD_DIR + fileName, function (fsErr) {
              if (fsErr) {
                res.json({
                  err: 1,
                  msg: 'Ah crap! Something bad happened'
                });
              } else {
                res.json({
                  err: 0,
                  attachment: attachment
                });
              }
            });
          });
        });
      }
    });

  });

  /* Return an image of rendered text  */
  app.post('/designer/getText', function (req, res) {

    var fontSize = req.body.fontSize;
    var fontFamily = req.body.fontFamily;
    var color = req.body.color;
    var text = req.body.text;
    var lines = text.split(/\r\n|\r|\n/);

    var maxWidth = 0;

    var dummy = (new Canvas(200, 200)).getContext('2d');
    dummy.font = fontSize + 'px ' + fontFamily;

    for (var line in lines) {
      var currentWidth = dummy.measureText(lines[line]).width;
      if (currentWidth > maxWidth) {
        maxWidth = currentWidth;
      }
    }

    var canvas = new Canvas(maxWidth, parseInt(fontSize * lines.length * 1.2));
    var context = canvas.getContext('2d');
    context.font = fontSize + 'px ' + fontFamily;
    context.fillStyle = color;
    context.textBaseline = 'top';

    for (line in lines) {
      context.fillText(lines[line], 0, fontSize * line * 1.2);
    }


    res.json({
      dataURL: canvas.toDataURL()
    });

    /*
     var canvas = new Canvas(img.width, img.height);
     var ctx = canvas.getContext('2d');
     ctx.drawImage(img, 0, 0, img.width, img.height);
     responseImage(canvas);

     var responseImage = function(canvas){
     res.writeHead(200, { 'Content-Type': 'image/png' } );
     canvas.toBuffer(function(err, buf){
     res.end(buf);
     console.log(buf);
     });

     }
     img.src = ATTACHMENT_DIR + req.params.filename;

     */
  });


  app.post('/designer/createImage', function (req, res) {
    var objectId = new ObjectId(req.body.id);

    models.design.find({_id: objectId}).exec(function (err, designs) {
      if (designs[0]) {
        var design = designs[0];

        var content = JSON.parse(design.content);
        var settings = JSON.parse(design.settings || '{}');

        var width = parseInt(settings.width || 1748);
        var height = parseInt(settings.height || 1240);

        var canvas = new Canvas(width, height);
        var context = canvas.getContext('2d');

        var layers = [];
        var index = 0;

        var addLayer = function (layer) {
          layers.push(layer);
          var img = new Canvas.Image;
          img.src = layer;
          context.drawImage(img, 0, 0, img.width, img.height);

          index++;
          if (index === content.length) {
            //ends
            create_image();
          } else {
            panel.draw(Canvas, objectId, content[index], settings, addLayer);
          }
        };

        var create_image = function () {
          var dir = path.join(__dirname, '../designs/');
          var out = fs.createWriteStream(dir + objectId.toString() + '.png');
          var stream = canvas.pngStream();

          stream.on('data', function(chunk){
            out.write(chunk);
          });

          stream.on('end', function(){
            console.log('design created');
            create_thumbnail();
          });
        };


        var create_thumbnail = function () {
          var tWidth = 200;
          var tHeight = parseInt(200 * height / width);
          var tCanvas = new Canvas(tWidth, tHeight);
          var tContext = tCanvas.getContext('2d');
          var tImage = new Canvas.Image;
          tImage.src = canvas.toDataURL();
          tContext.drawImage(tImage, 0, 0, tWidth, tHeight);

          var dir = path.join(__dirname, '../designs/');
          var out = fs.createWriteStream(dir + objectId.toString() + '_small.png');
          var stream = tCanvas.pngStream();

          stream.on('data', function(chunk){
            out.write(chunk);
          });

          stream.on('end', function(){
            res.json({
              err: 0,
              url: '/designs/' + objectId.toString() + '.png'
            });
          });
        };

        console.log('here again');
        panel.draw(Canvas, objectId, content[index], settings, addLayer);

      }
    });
  });

};