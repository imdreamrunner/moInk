var PanelHoverView = Backbone.View.extend({
  el: '<div id="object-hover">',

  initialize: function(){
    $('#panel-float').append(this.$el);
    this.$el.hide();
    this.listenTo(designer.objectList, 'hover', this.onHover);
  },

  onHover: function(model, isHover){
    var hoverList = designer.objectList.hover();
    if(hoverList.length === 0){
      console.log('here2');
      this.close();
    }else{
      this.model = hoverList[hoverList.length - 1];
      this.$el.show();
      this.render();
    }
    /*
    if(isHover){
      this.model = model;
      this.$el.show();
      this.render();
    }else{
      var hoverList = designer.objectList.hover();
      if(hoverList.length === 0){
        console.log('here2');
        this.close();
      }else{
        this.model = hoverList[0];
        this.$el.show();
        this.render();
      }
    }
    */
  },

  render: function(){
    var x, y, width, height;

    x = this.model.get('x');
    y = this.model.get('y');
    width = this.model.get('_actualWidth') || this.model.get('width');
    height = this.model.get('_actualHeight') || this.model.get('height');

    this.$el.css({
      'margin-left': parseInt((x - width / 2) * designer.scale) - 5,
      'margin-top': parseInt((y - height / 2) * designer.scale) - 5,
      width: parseInt(width * designer.scale) + 8,
      height: parseInt(height * designer.scale) + 8
    });

    var rotate = this.model.get('rotate');
    if(rotate){
      this.$el.rotate(rotate);
    }else{
      this.$el.rotate(0);
    }
    this.$el.selectLess();
  },

  close: function(){
    this.stopListening(this.model);
    this.$el.hide();
  }
});