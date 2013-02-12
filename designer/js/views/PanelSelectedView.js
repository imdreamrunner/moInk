var PanelSelectedView = PanelHoverView.extend({
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
      this.startPageX = e.pageX;
      this.startPageY = e.pageY;
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
    if(this.resize === 'top-handler'
      || this.resize === 'right-top-handler'
      || this.resize === 'left-top-handler'){
      var move = (e.pageY - this.startPageY) / designer.scale
      y = parseInt(y + move);
      height = parseInt(height - move);
    }
    if(this.resize === 'right-handler'
      || this.resize === 'right-bottom-handler'
      || this.resize === 'right-top-handler'){
      width = parseInt(width + (e.pageX - this.startPageX) / designer.scale);
    }
    if(this.resize === 'bottom-handler'
      || this.resize === 'right-bottom-handler'
      || this.resize === 'left-bottom-handler'){
      height = parseInt(height + (e.pageY - this.startPageY) / designer.scale);
    }
    if(this.resize === 'left-handler'
      || this.resize === 'left-bottom-handler'
      || this.resize === 'left-top-handler'){
      var move = (e.pageX - this.startPageX) / designer.scale
      x = parseInt(x + move);
      width = parseInt(width - move);
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