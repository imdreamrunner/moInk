var ObjectId = require('mongoose').Types.ObjectId;
var Canvas = require('canvas');
var panel = require('../utilities/panel');

module.exports = function(app, models){
  app.get('/designs/:id', function(req, res){
    models.design.find({_id: new ObjectId(req.params.id)}).exec(function(err, designs){
      if(designs[0]){
        var design = designs[0];

        var content = JSON.parse(design.content);
        var settings = JSON.parse(design.settings || '{}');

        var width = settings.width || 1748;
        var height = settings.height || 1240;

        var canvas = new Canvas(width, height);
        var context = canvas.getContext('2d');

        var layers = [];
        var index = 0;

        var addLayer = function(layer){
          layers.push(layer);
          var img = new Canvas.Image;
          img.src = layer;
          context.drawImage(img, 0, 0, img.width, img.height);

          index++;
          if(index === content.length){
            //ends
            output();
          }else{
            panel.draw(Canvas, content[index], settings, addLayer);
          }
        };

        var output = function(){
          res.set('Content-Type', 'image/png');
          canvas.toBuffer(function(err, buf){
            res.end(buf);
          });
        };

        panel.draw(Canvas, content[index], settings, addLayer);

      }
    });

  });
};