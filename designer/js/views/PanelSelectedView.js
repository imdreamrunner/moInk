var PanelSelectedView = Backbone.View.extend({
  el: '<div id="object-selected">',

  initialize: function(){
    _.bindAll(this, 'mouseDown', 'doMove', 'endMove', 'doResize', 'endResize');

    $('#panel-float').append(this.$el);

    this.listenTo(this.model, 'change', this.change);
    this.listenTo(this.model, 'destroy', this.close);

    this.selectedRender();

    if(this.model.get('type') !== 'text'){
      this.$el.html($('#resize-handler').html());
    }
  },

  events: {
    'mousedown': 'mouseDown'
  },

  render: function(){
    var x, y, width, height;

    if(this.model.get('_cropping')){
      var sWidth = this.model.get('sWidth');
      var sHeight = this.model.get('sHeight')
      var widthScale = this.model.get('width') / sWidth;
      var heightScale = this.model.get('height') / sHeight;
      x = this.model.get('x') + (this.model.get('_originalWidth') / 2 - sWidth / 2 - this.model.get('sX'))* widthScale;
      y = this.model.get('y') + (this.model.get('_originalHeight') / 2 - sHeight / 2 - this.model.get('sY'))* widthScale;
      width = this.model.get('_originalWidth') * widthScale;
      height = this.model.get('_originalHeight') * heightScale;
    }else{
      x = this.model.get('x');
      y = this.model.get('y');
      width = this.model.get('_actualWidth') || this.model.get('width');
      height = this.model.get('_actualHeight') || this.model.get('height');
    }

    this.$el.css({
      'margin-left': parseInt((x - width / 2) * designer.scale) - 1,
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

  selectedRender: function(){
    if(this.model.get('_cropping')){
      if(!this.cropper){
        this.$el.html('');
        this.cropper = new CropperView({model: this.model});
      }
    }else{
      if(this.cropper){
        this.cropper.close();
        delete this.cropper;
        this.$el.html($('#resize-handler').html());
      }
    }
    this.render();
  },

  mouseDown: function(e){
    e.originalEvent.preventDefault();
    var className = e.target.className;
    if(className !== ''){
      console.log('resize');
      this.resize = className;
      this.originX = this.model.get('x');
      this.originY = this.model.get('y');
      this.originWidth = this.model.get('width');
      this.originHeight = this.model.get('height');
      $(document.body).on('mousemove', this.doResize);
      $(document.body).on('mouseup', this.endResize);
    }else{
      /* dragging */
      this.startX = parseInt(e.pageX / designer.scale - this.model.get('x'));
      this.startY = parseInt(e.pageY / designer.scale - this.model.get('y'));
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
    var x = parseInt(e.pageX / designer.scale - this.startX);
    var y = parseInt(e.pageY / designer.scale - this.startY);
    this.model.set({
      x: x,
      y: y
    });
  },

  /* for resize */

  endResize: function(){
    delete this.resize;
    $(document.body).off('mousemove', this.doResize);
    $(document.body).off('mouseup', this.endResize);
  },

  doResize: function(e){
    var x = this.originX;
    var y = this.originY;
    var width = this.originWidth;
    var height = this.originHeight;
    var rotate = this.model.get('rotate')||0;
    var sinR = Math.sin(Math.PI * rotate / 180);
    var cosR = Math.cos(Math.PI * rotate / 180);
    var newX = (e.pageX - designer.panelView.$el.offset().left) / designer.scale - x;
    var newY = (e.pageY - designer.panelView.$el.offset().top) / designer.scale - y;
    var rX = cosR * newX + sinR * newY;
    var rY = - sinR * newX + cosR * newY;

    if(this.resize === 'top-handler'
      || this.resize === 'right-top-handler'
      || this.resize === 'left-top-handler'){
      height = parseInt(this.originHeight / 2 - rY);
      x = parseInt(x - (rY + this.originHeight / 2) * sinR / 2);
      y = parseInt(y + (rY + this.originHeight / 2) * cosR / 2);
    }
    if(this.resize === 'bottom-handler'
      || this.resize === 'right-bottom-handler'
      || this.resize === 'left-bottom-handler'){
      height = parseInt(this.originHeight / 2 + rY);
      x = parseInt(x - (rY - this.originHeight / 2) * sinR / 2);
      y = parseInt(y + (rY - this.originHeight / 2) * cosR / 2);
    }
    if(this.resize === 'left-handler'
      || this.resize === 'left-bottom-handler'
      || this.resize === 'left-top-handler'){
      width = parseInt(this.originWidth / 2 - rX);
      x = parseInt(x + (rX + this.originWidth / 2) * cosR / 2);
      y = parseInt(y + (rX + this.originWidth / 2) * sinR / 2);
    }
    if(this.resize === 'right-handler'
      || this.resize === 'right-bottom-handler'
      || this.resize === 'right-top-handler'){
      width = parseInt(this.originWidth / 2 + rX);
      x = parseInt(x + (rX - this.originWidth / 2) * cosR / 2);
      y = parseInt(y + (rX - this.originWidth / 2) * sinR / 2);
    }

    this.model.set({
      x: x,
      y: y,
      width: width,
      height: height
    });
  },

  change: function(){
    if(this.model.get('_selected')){
      this.selectedRender();
    }else{
      this.close();
    }
  },

  close: function(){
    /*
     * This has been rewrite from hover view.
     */
    this.model.set({
      _cropping: false
    });
    if(this.cropper && this.cropper.close)
      this.cropper.close();
    this.off();
    this.stopListening();
    this.remove();
  }

});