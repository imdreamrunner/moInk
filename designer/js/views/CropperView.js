var CropperView = Backbone.View.extend({
  el: '<div id="object-cropper">',

  initialize: function(){
    _.bindAll(this, 'mouseDown', 'doMove', 'endMove', 'doCrop', 'endCrop');
    this.$el.html($('#crop-handler').html());
    $('#panel-float').append(this.$el);
    this.$el.hide();
    this.listenTo(designer.objectList, 'crop', this.onCrop);
  },

  onCrop: function(model, isCropping){
    if(isCropping){
      this.model = model;
      this.listenTo(this.model, 'change', this.render);
      this.$el.show();
      this.render();
    }else{
      this.close();
    }

  },

  render: function(){
    var x = this.model.get('x');
    var y = this.model.get('y');

    var width = this.model.get('_actualWidth') || this.model.get('width');
    var height = this.model.get('_actualHeight') || this.model.get('height');

    this.$el.css({
      'margin-left': parseInt((x - width / 2) * designer.scale) -1,
      'margin-top': parseInt((y - height / 2) * designer.scale) - 1,
      width: parseInt(width * designer.scale),
      height: parseInt(height * designer.scale)
    });

    var rotate = this.model.get('rotate');
    if(rotate){
      this.$el.rotate(rotate);
    }
    this.$el.selectLess();
  },

  events: {
    'mousedown': 'mouseDown'
  },

  mouseDown: function(e){
    e.originalEvent.preventDefault();
    var className = e.target.className;
    if(className !== ''){
      /* cropping */
      this.crop = className;
      this.originX = this.model.get('x');
      this.originY = this.model.get('y');
      this.originSX = this.model.get('sX');
      this.originSY = this.model.get('sY');
      this.originWidth = this.model.get('width');
      this.originHeight = this.model.get('height');
      this.originSWidth = this.model.get('sWidth');
      this.originSHeight = this.model.get('sHeight');
      $(document.body).on('mousemove', this.doCrop);
      $(document.body).on('mouseup', this.endCrop);
    }else{
      /* dragging */
      var width = this.model.get('width');
      var sWidth = this.model.get('sWidth');
      var height = this.model.get('height');
      var sHeight = this.model.get('sHeight');
      this.startPageX = e.pageX;
      this.startPageY = e.pageY;
      this.originSX = this.model.get('sX');
      this.originSY = this.model.get('sY');
      this.widthScale = width / sWidth;
      this.heightScale = height / sHeight;
      $(document.body).on('mousemove', this.doMove);
      $(document.body).on('mouseup', this.endMove);
    }
  },

  /* for move */
  endMove: function(e){
    $(document.body).off('mousemove', this.doMove);
    $(document.body).off('mouseup', this.endMove);
  },

  doMove: function(e){
    var rotate = this.model.get('rotate')||0;
    var sinR = Math.sin(Math.PI * rotate / 180);
    var cosR = Math.cos(Math.PI * rotate / 180);

    var sX, sY;
    var newX = (e.pageX - this.startPageX) / (this.widthScale * designer.scale);
    var newY = (e.pageY - this.startPageY) / (this.heightScale * designer.scale);
    var moveX = cosR * newX + sinR * newY;
    var moveY = - sinR * newX + cosR * newY;
    sX = parseInt(this.originSX - moveX);
    sY = parseInt(this.originSY - moveY);

    if(sX < 0){
      sX = 0;
    }
    if(sX > (this.model.get('_originalWidth') - this.model.get('sWidth'))){
      sX = this.model.get('_originalWidth') - this.model.get('sWidth');
    }
    if(sY < 0){
      sY = 0;
    }
    if(sY > (this.model.get('_originalHeight') - this.model.get('sHeight'))){
      sY = this.model.get('_originalHeight') - this.model.get('sHeight');
    }
    this.model.set({
      sX: sX,
      sY: sY
    });
  },

  /* for crop */

  endCrop: function(){
    delete this.resize;
    $(document.body).off('mousemove', this.doCrop);
    $(document.body).off('mouseup', this.endCrop);
  },

  doCrop: function(e){
    var x = this.originX;
    var y = this.originY;
    var sX = this.originSX;
    var sY = this.originSY;
    var width = this.originWidth;
    var height = this.originHeight;
    var sWidth = this.originSWidth;
    var sHeight = this.originSHeight;
    var widthScale = width / sWidth;
    var heightScale = height / sHeight;
    var move;

    var rotate = this.model.get('rotate')||0;
    var sinR = Math.sin(Math.PI * rotate / 180);
    var cosR = Math.cos(Math.PI * rotate / 180);
    var newX = (e.pageX - designer.panelView.$el.offset().left) / designer.scale - x;
    var newY = (e.pageY - designer.panelView.$el.offset().top) / designer.scale - y;
    var rX = cosR * newX + sinR * newY;
    var rY = - sinR * newX + cosR * newY;

    if(this.crop === 'top-handler'
      || this.crop === 'right-top-handler'
      || this.crop === 'left-top-handler'){
      move = rY + this.originHeight / 2;
      sY = parseInt(sY + move / heightScale);
      if(sY < 0){
        sY = 0;
        move = - this.originSY * heightScale;
      }

      x = parseInt(x - move * sinR / 2);
      y = parseInt(y + move * cosR / 2);
      height = parseInt(height - move);
      sHeight = parseInt(sHeight - move / heightScale);
    }

    if(this.crop === 'bottom-handler'
      || this.crop === 'right-bottom-handler'
      || this.crop === 'left-bottom-handler'){
      move = rY - this.originHeight / 2;
      var originalHeight = this.model.get('_originalHeight');
      sHeight = parseInt(sHeight + move / heightScale);
      if((sHeight + sY) > originalHeight){
        sHeight = this.model.get('_originalHeight') - sY;
        height = parseInt(sHeight * heightScale);
        x = parseInt(x - (sHeight - this.originSHeight) * heightScale * sinR / 2);
        y = parseInt(y + (sHeight - this.originSHeight) * heightScale * cosR / 2);
      }else{
        x = parseInt(x - move * sinR / 2);
        y = parseInt(y + move * cosR / 2);
        height = parseInt(height + move);
      }
    }

    if(this.crop === 'left-handler'
      || this.crop === 'left-bottom-handler'
      || this.crop === 'left-top-handler'){
      move = rX + this.originWidth / 2;
      sX = parseInt(sX + move / widthScale);
      if(sX < 0){
        sX = 0;
        move = - this.originSX * widthScale;
      }
      x = parseInt(x + move * cosR / 2);
      y = parseInt(y + move * sinR / 2);
      width = parseInt(width - move);
      sWidth = parseInt(sWidth - move / widthScale);
    }

    if(this.crop === 'right-handler'
      || this.crop === 'right-bottom-handler'
      || this.crop === 'right-top-handler'){
      move = rX - this.originWidth / 2;
      sWidth = parseInt(sWidth + move / widthScale);
      if((sWidth + sX) > this.model.get('_originalWidth')){
        sWidth = this.model.get('_originalWidth') - sX;
        width = sWidth * widthScale;
        x = parseInt(x + (sWidth - this.originSWidth) * widthScale * cosR / 2);
        y = parseInt(y + (sWidth - this.originSWidth) * widthScale * sinR / 2);
      }else{
        x = parseInt(x + move * cosR / 2);
        y = parseInt(y + move * sinR / 2);
        width = parseInt(width + move);
      }
    }

    this.model.set({
      x: x,
      y: y,
      sX: sX,
      sY: sY,
      width: width,
      height: height,
      sWidth: sWidth,
      sHeight: sHeight
    });
  },

  close: function(){
    this.stopListening(this.model);
    this.$el.hide();
  }
});