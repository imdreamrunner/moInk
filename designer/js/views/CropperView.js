var CropperView = Backbone.View.extend({
  el: '<div id="object-cropper">',

  initialize: function(){
    _.bindAll(this, 'mouseDown', 'doCrop', 'endCrop');
    this.$el.html($('#crop-handler').html());
    $('#panel-float').append(this.$el);
    this.render();
    this.listenTo(this.model, 'change', this.render);
  },

  render: function(){
    var x = this.model.get('x');
    var y = this.model.get('y');

    var width = this.model.get('_actualWidth') || this.model.get('width');
    var height = this.model.get('_actualHeight') || this.model.get('height');

    this.$el.css({
      'margin-left': parseInt(x * designer.scale) -1,
      'margin-top': parseInt(y * designer.scale) - 1,
      width: parseInt(width * designer.scale),
      height: parseInt(height * designer.scale)
    });

    this.$el.selectLess();
  },

  events: {
    'mousedown': 'mouseDown'
  },

  mouseDown: function(e){
    e.originalEvent.preventDefault();
    var className = e.target.className;
    if(className !== ''){
      this.crop = className;
      this.startPageX = e.pageX;
      this.startPageY = e.pageY;
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
    }
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

    if(this.crop === 'top-handler'
      || this.crop === 'right-top-handler'
      || this.crop === 'left-top-handler'){
      var move = (e.pageY - this.startPageY) / designer.scale;
      sY = parseInt(sY + move / heightScale);
      if(sY < 0){
        sY = 0;
        move = - this.originSY * heightScale;
      }

      y = parseInt(y + move);
      height = parseInt(height - move);
      sHeight = parseInt(sHeight - move / heightScale);
    }

    if(this.crop === 'left-handler'
      || this.crop === 'left-bottom-handler'
      || this.crop === 'left-top-handler'){
      var move = (e.pageX - this.startPageX) / designer.scale;
      sX = parseInt(sX + move / widthScale);
      if(sX < 0){
        sX = 0;
        move = - this.originSX * widthScale;
      }
      x = parseInt(x + move);
      width = parseInt(width - move);
      sWidth = parseInt(sWidth - move / widthScale);
    }

    if(this.crop === 'bottom-handler'
      || this.crop === 'right-bottom-handler'
      || this.crop === 'left-bottom-handler'){
      var move = (e.pageY - this.startPageY) / designer.scale;
      sHeight = parseInt(sHeight + move / heightScale);
      if(sHeight > this.model.get('_originalHeight')){
        sHeight = this.model.get('_originalHeight');
        height = parseInt(sHeight * heightScale);
      }else{
        height = parseInt(height + move);
      }
    }

    if(this.crop === 'right-handler'
      || this.crop === 'right-bottom-handler'
      || this.crop === 'right-top-handler'){
      var move = (e.pageX - this.startPageX) / designer.scale;
      sWidth = parseInt(sWidth + move / widthScale);
      if(sWidth > this.model.get('_originalWidth')){
        sWidth = this.model.get('_originalWidth');
        width = sWidth * widthScale;
      }else{
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
    this.off();
    this.stopListening();
    this.remove();
  }
});