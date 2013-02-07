var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function(app, models){
  app.post('/designer/getPic', function(req, res){

    var Canvas = require('canvas')
      , canvas = new Canvas(200,200)
      , ctx = canvas.getContext('2d');

    ctx.font = '30px Impact';
    ctx.rotate(.1);
    ctx.fillText("Awesome!", 50, 100);

    var te = ctx.measureText('Awesome!');
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.lineTo(50, 102);
    ctx.lineTo(50 + te.width, 102);
    ctx.stroke();


    res.set('Content-Type', 'image/png');
    res.write(canvas.toDataURL());
    res.end();
    /*

     res.json({
     ok: 'ok',
     content: req.body.content
     });

     */
  });

  app.get('/designer/:id', function(req, res){
    models.design.find({_id: new ObjectId(req.params.id)}).exec(function(err, designs){
      if(designs[0]){
        res.render('designer/designer', {
          design: designs[0]
        });
      }
    });
  });

  // Todo: check whether the user own this design.

  app.post('/designer/get', function(req, res){
    models.design.find({_id: new ObjectId(req.body.id)}).exec(function(err, designs){
      if(designs[0]){
        res.json({
          err: 0,
          design: designs[0]
        });
      }
    });
  });

  app.post('/designer/save', function(req, res){
    models.design.find({_id: new ObjectId(req.body.id)}).exec(function(err, designs){
      if(designs[0]){
        var design = designs[0];
        design.content = req.body.content;
        design.save(function(){
          res.json({
            err: 0
          });
        });
      }
    });
  });

  /* Get Image from Third Party Websites */

  app.post('/designer/image/getFromURL', function(req, res){
    /*
     * Download method from http://www.hacksparrow.com/using-node-js-to-download-files.html
     */

    // Dependencies
    var fs = require('fs');
    var url = require('url');
    var http = require('http');

    // App variables
    var designId = req.body.id;
    var fileURL = req.body.url;
    var DOWNLOAD_DIR = './attachments/images/';

    //download_file_httpget(file_url);

    fileInfo = {
      designId: designId,
      url: fileURL
    }

    models.design.addAttachment(fileInfo, function(err, attachment){
      var attachmentId = attachment._id;
      var urlParse = url.parse(fileURL);
      var options = {
        host: urlParse.host.split(":")[0],
        port: urlParse.host.split(":")[1] || 80,
        path: urlParse.pathname
      };

      var file_name = attachmentId + '.' + urlParse.pathname.split('.').pop();
      var file = fs.createWriteStream(DOWNLOAD_DIR + file_name);

      http.get(options, function(response) {
        response.on('data', function(data) {
          file.write(data);
          console.log('write data');
        }).on('end', function() {
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
};