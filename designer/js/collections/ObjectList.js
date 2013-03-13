var ObjectList = Backbone.Collection.extend({
  model: PanelObject,

  initialize: function(){
  },

  selected: function(){
    return this.filter(function(object){
      return object.get('_selected');
    })
  },

  hover: function(){
    return this.filter(function(object){
      return object.get('_hover');
    })
  },

  unSelectAll: function(){
    var unSelect = function(object){
      object.unset('_selected');
    };
    _.each(this.selected(), unSelect);
  },

  unHoverAll: function(){
    var unHover = function(object){
      object.unset('_hover');
    };
    _.each(this.hover(), unHover);
  },

  nextOrder: function() {
    if (!this.length){
      return 1;
    }else{
      return this.last().get('order') + 1;
    }
  },

  comparator: function(model) {
    var order = model.get('order');
    return order;
  }
});