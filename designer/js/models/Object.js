var PanelObject = Backbone.Model.extend({
  initialize: function(){
    this.on('change', this.onChange);
  },

  defaults: function(){
    return {
      name: '',
      display: true,
      _selected: false,
      _hover: false,
      type: '',
      order: designer.objectList.nextOrder()
    }
  },

  onChange: function(){
    if(this.hasChanged('_selected')){
      this.trigger('select', this, this.get('_selected'));
    }
    if(this.hasChanged('_hover')){
      this.trigger('hover', this, this.get('_hover'));
    }
    if(this.hasChanged('_cropping')){
      this.trigger('crop', this, this.get('_cropping'));
    }
  },

  needRender: function(){
    var changedAttributes = this.changedAttributes();
    for(var name in changedAttributes){
      if(name[0] !== '_' && name !== 'order'){
        return true;
      }
    }
    return false;
  }
});