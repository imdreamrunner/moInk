var PanelSelectedView = Backbone.View.extend({
  el: '<div id="object-selected">',

  initialize: function(){
    _.bindAll(this, 'mouseDown', 'doMove', 'endMove', 'doResize', 'endResize');
    this.listenTo(designer.objectList, 'select', this.onSelect);
    $('#panel-float').append(this.$el);
    this.$el.hide();
  },

  events: {
    'mousedown': 'mouseDown'
  },

  onSelect: function(model, selected){
    if(selected){
      this.model = model;
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.close);
      this.$el.show();
      this.render();
      if(this.model.get('type') !== 'text'){
        this.$el.html($('#resize-handler').html());
      }else{
        this.$el.html('');
      }
    }else{
      this.close();
    }
  },

  render: function(){
    var x = this.model.get('x');
    var y = this.model.get('y');
    var width = this.model.get('_actualWidth') || this.model.get('width');
    var height = this.model.get('_actualHeight') || this.model.get('height');
    var rotate = this.model.get('rotate') || 0;

    if(this.model.get('_cropping')){
      /* For Whole Pic */
      var sWidth = this.model.get('sWidth');
      var sHeight = this.model.get('sHeight');
      var sX = this.model.get('sX');
      var sY = this.model.get('sY');
      var originalWidth = this.model.get('_originalWidth');
      var originalHeight = this.model.get('_originalHeight');
      var widthScale = width / sWidth;
      var heightScale = height / sHeight;
      var sinR = Math.sin(Math.PI * rotate / 180);
      var cosR = Math.cos(Math.PI * rotate / 180);

      var rX = (2 * sX - originalWidth + sWidth) * widthScale / 2;
      var rY = (2 * sY - originalHeight + sHeight) * heightScale / 2;

      this.$el.css({
        'margin-left': parseInt((x - originalWidth * widthScale / 2 - (cosR * rX - sinR * rY)) * designer.scale) - 1,
        'margin-top': parseInt((y - originalHeight * heightScale / 2 - (sinR * rX + cosR * rY)) * designer.scale) - 1,
        width: parseInt(widthScale * originalWidth * designer.scale),
        height: parseInt(heightScale * originalHeight * designer.scale)
      });

    }else{
      /* For displayable pic */
      this.$el.css({
        'margin-left': parseInt((x - width / 2) * designer.scale) - 1,
        'margin-top': parseInt((y - height / 2) * designer.scale) - 1,
        width: parseInt(width * designer.scale),
        height: parseInt(height * designer.scale)
      });
    }

    if(rotate){
      this.$el.rotate(rotate);
    }
    this.$el.selectLess();
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
      this.originSX = this.model.get('sX');
      this.originSY = this.model.get('sY');
      this.originSWidth = this.model.get('sWidth');
      this.originSHeight = this.model.get('sHeight');
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

    if(this.model.get('_cropping')){
      /* Resize when cropping */
      var sX = this.originSX;
      var sY = this.originSY;
      var sWidth = this.originSWidth;
      var sHeight = this.originSHeight;
      var originalWidth = this.model.get('_originalWidth');
      var originalHeight = this.model.get('_originalHeight');
      var widthScale = width / sWidth;
      var heightScale = height / sHeight;
      var changeX, changeY, changeWidthScale, changeHeightScale;

      if(this.resize === 'top-handler'
        || this.resize === 'right-top-handler'
        || this.resize === 'left-top-handler'){
        changeY = rY + this.originHeight / 2 + sY * heightScale;
        changeHeightScale = originalHeight / (originalHeight  - changeY / heightScale);
        if(changeHeightScale < originalHeight / (originalHeight - sY)){
          /* Within area */
          sY = parseInt(sY * changeHeightScale - changeY / heightScale * changeHeightScale);
          sHeight = parseInt(sHeight * changeHeightScale);
        }else{
          /* Out of area */
          sHeight = parseInt(sHeight * originalHeight / (originalHeight - sY));
          sY = 0;
        }
      }
      if(this.resize === 'bottom-handler'
        || this.resize === 'right-bottom-handler'
        || this.resize === 'left-bottom-handler'){
        changeY = rY - this.originHeight / 2 - (originalHeight - sHeight - sY) * heightScale;
        changeHeightScale = Math.min(originalHeight / (originalHeight + changeY / heightScale),
          originalHeight / (sY + sHeight));
        sY = parseInt(sY * changeHeightScale);
        sHeight = parseInt(sHeight * changeHeightScale);
      }
      if(this.resize === 'left-handler'
        || this.resize === 'left-bottom-handler'
        || this.resize === 'left-top-handler'){
        changeX = rX + this.originWidth / 2 + sX * widthScale ;
        changeWidthScale = originalWidth / (originalWidth - changeX / widthScale);
        if(changeWidthScale < originalWidth / (originalWidth - sX)){
          sX = parseInt(sX * changeWidthScale - changeX / widthScale * changeWidthScale);
          sWidth = parseInt(sWidth * changeWidthScale);
        }else{
          sWidth = parseInt(sWidth * originalWidth / (originalWidth - sX));
          sX = 0;
        }
      }
      if(this.resize === 'right-handler'
        || this.resize === 'right-bottom-handler'
        || this.resize === 'right-top-handler'){
        changeX = rX - this.originWidth / 2 - (originalWidth - sWidth - sX) * widthScale ;
        changeWidthScale = Math.min(originalWidth / (originalWidth + changeX / widthScale),
          originalWidth / (sX + sWidth));
        sX = parseInt(sX * changeWidthScale);
        sWidth = parseInt(sWidth * changeWidthScale);
      }
      this.model.set({
        sX: sX,
        sY: sY,
        sWidth: sWidth,
        sHeight: sHeight
      });
    }else{
      /* Normal Resize */
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
    }
  },

  close: function(){
    this.model.set({
      _cropping: false
    });
    if(this.cropper && this.cropper.close)
      this.cropper.close();
    this.stopListening(this.model);
    this.$el.hide();
  }

});