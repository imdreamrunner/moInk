var ObjectListItemView = Backbone.View.extend({
  tagName: 'li',

  template: _.template($('#object-list-item-template').html()),

  events: {
    'mousedown': 'mouseDown',
    'mouseenter': 'mouseEnter',
    'click .object-list-delete': 'delete',
    'click .object-list-hide': 'hide',
    'click .object-list-name': 'rename'
  },

  initialize: function(){
    _.bindAll(this, 'beginDrag', 'doDrag', 'endDrag');
    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'destroy', this.close);
    this.render();
  },

  render: function(){
    this.$el.html(this.template(this.model.toJSON()));
    if(designer.listDragging && designer.listDragging === this.model){
      this.$el.find('.object-list-item').addClass('dragging');
    }else if(this.model.get('_selected')){
      this.$el.find('.object-list-item').addClass('selected');
    }else{
      if(this.model.get('_hover')){
        this.$el.find('.object-list-item').addClass('hover');
      }
    }
  },

  close: function(){
    this.off();
    this.stopListening();
    this.remove();
  },

  select: function(){
    if(this.model.get('_selected')){
      //this.model.set({selected: false});
    }else{
      var unSelect = function(model){
        model.set({_selected: false});
      };
      _.each(designer.objectList.selected(), unSelect);
      this.model.set({_selected: true});
    }
  },

  mouseDown: function(e){
    if(e.target.className !== 'edit-item-name'){
      e.originalEvent.preventDefault();
      this.select();
      if(e.target.className === 'object-list-icon'){
        this.beginDrag(e);
      }
    }
  },

  mouseEnter: function(e){
    if(designer.listDragging){
      if(designer.listDragging !== this.model){
        var this_order = this.model.get('order');
        this.model.set({
          order: designer.listDragging.get('order')
        });
        designer.listDragging.set({
          order: this_order
        });
        designer.objectList.sort();
      }
    }
  },

  beginDrag: function(e){
    $(document.body).on('mouseup', this.endDrag);
    $(document.body).on('mousemove', this.doDrag);
  },

  endDrag: function(){
    console.log('drag end');
    designer.listDragging = null;
    $(document.body).off('mouseup', this.endDrag);
    $(document.body).off('mousemove', this.doDrag);
    $('.object-list-item.dragging').removeClass('dragging').addClass('selected');
  },

  doDrag: function(){
    if(!designer.listDragging){
      designer.listDragging = this.model;
      this.$el.find('.object-list-item').removeClass('selected');
      this.$el.find('.object-list-item').addClass('dragging');
    }
  },

  delete: function(){
    this.model.destroy();
  },

  hide: function(){
    this.model.set({
      display: !this.model.get('display')
    });
  },

  rename: function(){
    var _this = this;
    this.$el.find('.edit-item-name').show().focus();
    var finishEdit = function(){
      _this.model.set({
        name: _this.$el.find('.edit-item-name').val()
      });
      _this.$el.find('.edit-item-name').hide();
    }
    this.$el.find('.edit-item-name').on('blur', finishEdit);
    var keyDown = function(e){
      if(e.keyCode === 13){
        // press ENTER
        finishEdit();
      }
    }
    this.$el.find('.edit-item-name').on('keydown', keyDown);
  }
});