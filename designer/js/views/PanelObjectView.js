var PanelObjectView = Backbone.View.extend({

  initialize: function(){
    _.bindAll(this, 'render', 'drawImage', 'drawShape', 'drawText', 'getText');

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
          };
          if(this.model.get('attachment')){
            this.imageObject.src = '/attachments/images/' + this.model.get('attachment');
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
    this.model.set({
      _originalWidth: this.imageObject.width,
      _originalHeight: this.imageObject.height,
      silent: true
    });

    if(!this.model.has('width')){
      this.model.set({
        width: this.imageObject.width,
        height: this.imageObject.height,
        silent: true
      });
    }

    if(!this.model.has('x')){
      this.model.set({
        x: parseInt((designer.width) / 2),
        silent: true
      });
    }

    if(!this.model.has('y')){
      this.model.set({
        y: parseInt((designer.height) / 2),
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
    var rotate = this.model.get('rotate');
    var x = this.model.get('x');
    var y = this.model.get('y');
    var width = this.model.get('width');
    var height = this.model.get('height');

    context.save();
    context.translate(x, y);

    if(rotate){
      context.rotate(Math.PI * rotate / 180);
    }else{

    }
    context.drawImage(this.imageObject,
      this.model.get('sX'), this.model.get('sY'), this.model.get('sWidth'), this.model.get('sHeight'),
      - width / 2, - height / 2, width, height);
    context.restore();
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
          x = parseInt((designer.width) / 2);
        }
        if(isNaN(y)){
          y = parseInt((designer.height) / 2);
        }
        this.model.set({
          x: x,
          y: y
        });

        context.save();
        context.translate(x, y);
        context.beginPath();
        context.rect(- width / 2, - height / 2, width, height);
        context.fillStyle = color;
        context.fill();
        context.restore();
        /*
        context.lineWidth = 7;
        context.strokeStyle = 'black';
        context.stroke();
        */
        break;
    }
  },

  getText: function(){
    var _this = this;
    $.ajax({
      type: "POST",
      url: DESIGNER_URL + 'getText',
      data: {
        text: this.model.get('text'),
        fontFamily: this.model.get('fontFamily'),
        fontSize: this.model.get('fontSize'),
        color: this.model.get('color')
      },
      success: function(result){
        _this.textImage = new Image();
        _this.textImage.onload = function(){
          _this.model.set({
            _actualWidth: _this.textImage.width,
            _actualHeight: _this.textImage.height
          });
          _this.drawText();
        };
        _this.textImage.src = result.dataURL;
      }
    });
  },

  drawText: function(){
    if(!this.textImage
      || this.model.hasChanged('text')
      || this.model.hasChanged('color')
      || this.model.hasChanged('fontFamily')
      || this.model.hasChanged('fontSize')
      ){
      this.getText();
      return;
    }

    var context = this.$el[0].getContext('2d');

    if(!this.model.has('x')){
      this.model.set({
        x: parseInt((designer.width) / 2),
        silent: true
      });
    }

    if(!this.model.has('y')){
      this.model.set({
        y: parseInt((designer.height) / 2),
        silent: true
      });
    }
    var x = this.model.get('x');
    var y = this.model.get('y');
    context.save();
    context.translate(x, y);
    context.drawImage(this.textImage, - this.textImage.width / 2, - this.textImage.height / 2);
    context.restore();

  },

  isHover: function(mouseX, mouseY){
    var x = this.model.get('x');
    var y = this.model.get('y');
    var width = this.model.get('_actualWidth') || this.model.get('width');
    var height = this.model.get('_actualHeight') || this.model.get('height');

    var rotate = this.model.get('rotate')||0;
    var sinR = Math.sin(Math.PI * rotate / 180);
    var cosR = Math.cos(Math.PI * rotate / 180);

    var newX = mouseX - x;
    var newY = mouseY - y;
    var rX = cosR * newX + sinR * newY;
    var rY = - sinR * newX + cosR * newY;

    return (Math.abs(rX) < width / 2 && Math.abs(rY) < height / 2);
  },

  mouseOver: function(mouseX, mouseY){
    var isHover = this.isHover(mouseX, mouseY);
    this.model.set({_hover: isHover});
    return isHover;
  },

  close: function(){
    this.stopListening();
    this.off();
    this.remove();
  }
});