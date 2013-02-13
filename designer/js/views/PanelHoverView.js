var PanelHoverView = Backbone.View.extend({
  el: '<div id="object-hover">',

  initialize: function(){
    $('#panel-float').append(this.$el);
    this.render();
  },

  render: function(){
    var x, y, width, height;

    x = this.model.get('x');
    y = this.model.get('y');
    width = this.model.get('_actualWidth') || this.model.get('width');
    height = this.model.get('_actualHeight') || this.model.get('height');

    this.$el.css({
      'margin-left': parseInt(x * designer.scale) - 5,
      'margin-top': parseInt(y * designer.scale) - 5,
      width: parseInt(width * designer.scale) + 8,
      height: parseInt(height * designer.scale) + 8
    });

    this.$el.selectLess();
  },

  close: function(){
    this.off();
    this.stopListening();
    this.remove();
  }
});