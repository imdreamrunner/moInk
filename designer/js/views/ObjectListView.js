var ObjectListView = Backbone.View.extend({
  el: '#ul-object-list',

  objectListItems: [],

  initialize: function(){
    _.bindAll(this, 'addOne', 'addAll');
    this.$el.selectLess();
    this.listenTo(designer.objectList, 'add', this.addOne);
    this.listenTo(designer.objectList, 'sort', this.addAll);


  },

  addOne: function(PanelObject){
    var newListItem = new ObjectListItemView({model: PanelObject});
    this.objectListItems.push(newListItem);
    this.$el.prepend(newListItem.$el);
  },

  addAll: function(){
    for(var i in this.objectListItems){
      this.objectListItems[i].close();
    }
    this.objectListItems.length = 0;
    _.each(designer.objectList.models, this.addOne);
  }
});