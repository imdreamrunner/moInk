var PanelHoverView = Backbone.View.extend({
  el: '<div id="object-hover">',

  initialize: function(){
    $('#panel-float').append(this.$el);
    this.render();
  },

  render: function(){
    var x, y, width, height;

    if(this.model.get('_cropping')){
      var widthScale = this.model.get('width') / this.model.get('sWidth');
      var heightScale = this.model.get('height') / this.model.get('sHeight');
      x = this.model.get('x') - widthScale * this.model.get('sX');
      y = this.model.get('y') - heightScale * this.model.get('sY');
      width = this.model.get('_originalWidth') * widthScale;
      height = this.model.get('_originalHeight') * heightScale;
    }else{
      x = this.model.get('x');
      y = this.model.get('y');
      width = this.model.get('_actualWidth') || this.model.get('width');
      height = this.model.get('_actualHeight') || this.model.get('height');
    }

    this.$el.css({
      'margin-left': parseInt(x * designer.scale) -1,
      'margin-top': parseInt(y * designer.scale) - 1,
      width: parseInt(width * designer.scale),
      height: parseInt(height * designer.scale)
    });

    this.$el.selectLess();
  },

  close: function(){
    this.off();
    this.stopListening();
    this.remove();
  }
});