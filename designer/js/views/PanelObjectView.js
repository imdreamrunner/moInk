var PanelObjectView = Backbone.View.extend({

  initialize: function(){
    _.bindAll(this, 'render', 'drawImage', 'drawShape', 'drawText');

    this.$el = $('<canvas width="' + designer.width + '" height="' + designer.height + '"></canvas>');
    this.$el.css({
      position: 'absolute',
      width: designer.panelWidth,
      height: designer.panelHeight
    });

    this.listenTo(this.model, 'change', this.change);
    this.listenTo(this.model, 'destroy', this.close);

    this.render();
  },

  render: function(){
    console.log('render ' + this.model.get('name'));
    var context = this.$el[0].getContext('2d');
    context.clearRect(0, 0, designer.width, designer.height);
    if(!this.model.get('display')){
      return;
    }
    switch(this.model.get('type')){
      case 'image':
        if(!this.imageObject){
          this.imageObject = new Image();
          this.imageObject.onload = this.drawImage;
          this.imageObject.onerror = function(){
            console.log('cannot load image');
          }
          if(this.model.get('attachment')){
            this.imageObject.src = '/attachments/images/' + this.model.get('attachment');
            console.log('/attachments/images/' + this.model.get('attachment'));
          }else{
            this.imageObject.src = this.model.get('source');
          }
        }else{
          this.drawImage();
        }
        break;

      case 'shape':
        this.drawShape();
        break;

      case 'text':
        this.drawText();
        break;
    }


  },

  change: function(){
    if(this.model.needRender()){
      this.render();
    }
  },

  drawImage: function(){
    var set = this.model.set({
      _originalWidth: this.imageObject.width,
      _originalHeight: this.imageObject.height,
      silent: true
    });

    if(!set){
      alert('Something wrong');
      // TODO: error handler.
    }

    if(!this.model.has('width')){
      this.model.set({
        width: this.imageObject.width,
        height: this.imageObject.height,
        silent: true
      });
    }

    if(!this.model.has('x')){
      this.model.set({
        x: parseInt((designer.width - this.model.get('width')) / 2),
        silent: true
      });
    }

    if(!this.model.has('y')){
      this.model.set({
        y: parseInt((designer.height - this.model.get('height')) / 2),
        silent: true
      });
    }

    if(!this.model.has('sWidth')){
      this.model.set({
        sWidth: this.imageObject.width,
        sHeight: this.imageObject.height,
        sX: 0,
        sY: 0,
        silent: true
      });
    }

    var context = this.$el[0].getContext('2d');
    context.drawImage(this.imageObject,
      this.model.get('sX'), this.model.get('sY'), this.model.get('sWidth'), this.model.get('sHeight'),
      this.model.get('x'), this.model.get('y'), this.model.get('width'), this.model.get('height'));
  },

  drawShape: function(){
    switch(this.model.get('shape')){
      case 'rect':
        var context = this.$el[0].getContext('2d');

        var x = this.model.get('x');
        var y = this.model.get('y');
        var width = this.model.get('width');
        var height = this.model.get('height');
        var color = this.model.get('color');

        if(isNaN(x)){
          x = parseInt((designer.width - width) / 2);
        }
        if(isNaN(y)){
          y = parseInt((designer.height - height) / 2);
        }
        this.model.set({
          x: x,
          y: y
        });

        context.beginPath();
        context.rect(x, y, width, height);
        context.fillStyle = color;
        context.fill();
        /*
        context.lineWidth = 7;
        context.strokeStyle = 'black';
        context.stroke();
        */
        break;
    }
  },

  drawText: function(){
    var context = this.$el[0].getContext('2d');

    var x = this.model.get('x') || 0;
    var y = this.model.get('y') || 0;
    var fontSize = this.model.get('fontSize');
    var fontFamily = this.model.get('fontFamily');
    var color = this.model.get('color');

    context.font = fontSize + 'px ' + fontFamily;
    context.fillStyle = color;
    context.textBaseline = 'top';

    var text = this.model.get('text');
    var lines = text.split(/\r\n|\r|\n/);

    var maxWidth = 0;
    var currentWidth = 0;

    for(var line in lines){
      context.fillText(lines[line], x, y + fontSize * line * 1.2);
      currentWidth = context.measureText(lines[line]).width;
      if(currentWidth > maxWidth){
        maxWidth = currentWidth;
      }
    }

    var width = maxWidth;
    var height = parseInt(fontSize * lines.length * 1.2);

    this.model.set({
      _actualWidth: width,
      _actualHeight: height
    });

    if(isNaN(x)){
      x = parseInt((designer.width - width) / 2);
    }
    if(isNaN(y)){
      y = parseInt((designer.height - height) / 2);
    }
    this.model.set({
      x: x,
      y: y
    });
  },

  isHover: function(mouseX, mouseY){
    var x = this.model.get('x');
    var y = this.model.get('y');
    var width = this.model.get('_actualWidth') || this.model.get('width');
    var height = this.model.get('_actualHeight') || this.model.get('height');
    if(x <= mouseX && mouseX <= (x + width)){
      if(y <= mouseY && mouseY <= (y + height)){
        return true;
      }
    }
    return false;
  },

  mouseOver: function(mouseX, mouseY){
    var isHover = this.isHover(mouseX, mouseY);
    this.model.set({_hover: isHover});
  },

  close: function(){
    this.stopListening();
    this.off();
    this.remove();
  }
});