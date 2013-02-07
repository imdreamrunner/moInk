var PanelHoverView = Backbone.View.extend({
  el: '<div id="object-hover">',

  initialize: function(){
    $('#panel-float').append(this.$el);
    this.render();
  },

  render: function(){
    var x = this.model.get('x');
    var y = this.model.get('y');

    var width = this.model.get('_actualWidth') || this.model.get('width');
    var height = this.model.get('_actualHeight') || this.model.get('height');

    this.$el.css({
      'margin-left': parseInt(x * designer.scale) - 6,
      'margin-top': parseInt(y * designer.scale) - 6,
      width: parseInt(width * designer.scale) + 10,
      height: parseInt(height * designer.scale) + 10
    });

    this.$el.selectLess();
  },

  close: function(){
    this.off();
    this.stopListening();
    this.remove();
  }
});