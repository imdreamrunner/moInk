var PanelObject = Backbone.Model.extend({
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