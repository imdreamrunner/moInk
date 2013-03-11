var PanelView = Backbone.View.extend({
  el: '#panel',

  events: {
    'mousemove': 'mouseMove',
    'mouseleave': 'mouseLeave',
    'click': 'click'
  },

  panelObjects: [],

  hoverObjectView: {},

  offset: {
    top: 112,
    left: 0,
    bottom: 0,
    right: 141
  },

  initialize: function(){
    _.bindAll(this, 'mouseMove', 'addOne', 'addAll');

    this.resize();

    this.listenTo(designer.objectList, 'add', this.addOne);
    this.listenTo(designer.objectList, 'sort', this.addAll);
  },

  resize: function(){
    var MARGIN_X = 40;
    var MARGIN_Y = 30;

    this.pageWidth = document.documentElement.clientWidth;
    this.pageHeight = document.documentElement.clientHeight;
    var availableWidth = this.pageWidth - this.offset.left - this.offset.right - 2 * MARGIN_X;
    var availableHeight = this.pageHeight - this.offset.top - this.offset.bottom - 2 * MARGIN_Y;
    designer.panelWidth = 0;
    designer.panelHeight = 0;
    designer.scale = 1;
    if((availableWidth/availableHeight) > (this.pageWidth/this.pageHeight)){
      designer.scale = availableHeight / designer.height;
      designer.panelHeight = availableHeight;
      designer.panelWidth = parseInt(availableHeight * designer.width / designer.height);
    }else{
      designer.scale = availableWidth / designer.width;
      designer.panelWidth = availableWidth;
      designer.panelHeight = parseInt(availableWidth * designer.height / designer.width);
    }
    this.$el.css({
      width: designer.panelWidth,
      height: designer.panelHeight,
      top: parseInt(this.offset.top + MARGIN_Y + (availableHeight - designer.panelHeight)/2),
      left: parseInt(this.offset.left + MARGIN_X + (availableWidth - designer.panelWidth)/2)
    });
    this.offset.pageX = this.$el.offset().left;
    this.offset.pageY = this.$el.offset().top;
  },

  addOne: function(PanelObject){
    var newObject = new PanelObjectView({model: PanelObject});
    this.panelObjects.push(newObject);
    this.$el.find('#canvas-container').append(newObject.$el);
  },

  addAll: function(){
    for(var i in this.panelObjects){
      this.panelObjects[i].close();
    }
    this.panelObjects.length = 0;
    _.each(designer.objectList.models, this.addOne);
  },

  mouseMove: function(e){
    var x = parseInt((e.pageX - this.offset.pageX) / designer.scale);
    var y = parseInt((e.pageY - this.offset.pageY) / designer.scale);
    var selectedList = designer.objectList.selected();
    if(selectedList.length === 0){
      for(var id in this.panelObjects){
        this.panelObjects[id].mouseOver(x, y);
      }
    }
  },

  mouseLeave: function(){
    designer.objectList.unHoverAll();
  },

  click: function(){
    var selectedList = designer.objectList.selected();
    if(selectedList.length === 0){
      var hoverList = designer.objectList.hover();
      if(hoverList.length > 0){
        designer.objectList.unHoverAll();
        hoverList[hoverList.length - 1].set({_selected: true});
      }
    }
  }
});