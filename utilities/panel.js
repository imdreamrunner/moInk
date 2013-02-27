exports.draw = function(Canvas, object, settings, callback){

  function drawImage(){

    var ATTACHMENT_DIR =  './attachments/images/';
    var img = new Canvas.Image;

    img.onload = function(){

      var canvas = new Canvas(settings.width || 1748, settings.height || 1240)
      var context = canvas.getContext('2d');

      var rotate = object.rotate;
      var x = object.x;
      var y = object.y;
      var width = object.width;
      var height = object.height;

      context.save();
      context.translate(x, y);

      if(rotate){
        context.rotate(Math.PI * rotate / 180);
      }else{

      }
      context.drawImage(img,
        object.sX, object.sY, object.sWidth, object.sHeight,
        - width / 2, - height / 2, width, height);
      context.restore();

      callback(canvas.toDataURL());

    };

    img.src = ATTACHMENT_DIR + object.attachment;
  }

  function drawShape(){

    var canvas = new Canvas(settings.width || 1748, settings.height || 1240)
    var context = canvas.getContext('2d');

    var x = object.x || 0;
    var y = object.y || 0;
    var width = object.width;
    var height = object.height;
    var color = object.color;


    context.save();
    context.translate(x, y);
    context.beginPath();
    context.rect(- width / 2, - height / 2, width, height);
    context.fillStyle = color;
    context.fill();
    context.restore();

    callback(canvas.toDataURL());
  }

  function drawText(){
    var canvas = new Canvas(settings.width || 1748, settings.height || 1240)
    var context = canvas.getContext('2d');

    var x = object.x || 0;
    var y = object.y || 0;
    var fontSize = object.fontSize;
    var fontFamily = object.fontFamily;
    var color = object.color;
    var text = object.text;
    var lines = text.split(/\r\n|\r|\n/);
    var line;
    var textWidth = 0;
    var textHeight = parseInt(fontSize * lines.length * 1.2);

    var dummy = (new Canvas(200, 200)).getContext('2d');
    dummy.font = fontSize + 'px ' + fontFamily;

    for(line in lines){
      var currentWidth = dummy.measureText(lines[line]).width;
      if(currentWidth > textWidth){
        textWidth = currentWidth;
      }
    }

    context.font = fontSize + 'px ' + fontFamily;
    context.fillStyle = color;
    context.textBaseline = 'top';

    context.save();
    context.translate(x, y);

    for(line in lines){
      context.fillText(lines[line], - textWidth / 2, fontSize * line * 1.2 - textHeight / 2);
    }

    context.restore();

    callback(canvas.toDataURL());
  }


  switch(object.type){
    case 'image':
      console.log('image');
      drawImage();
      break;

    case 'shape':
      console.log('shape');
      drawShape();
      break;

    case 'text':
      drawText();
      break;
  }

};

