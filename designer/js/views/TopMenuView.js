var TopMenuView = Backbone.View.extend({
  el: '#top-menu',

  template: _.template($('#top-menu-template').html()),
  template_model: _.template($('#top-menu-model-template').html()),

  events: {
    'click': 'click'
  },

  initialize: function(){
    if(this.topBarView && this.topBarView.close){
      this.topBarView.close();
    }
    if(this.model){
      this.$el.find('#top-menu-left').html(this.template_model(this.model.toJSON()));
      this.listenTo(this.model, 'destroy', this.modelDelete);
    }else{
      this.$el.find('#top-menu-left').html(this.template());
    }
    if(this.tab === 'edit' && this.model){
      this.$el.find('.top-menu-edit').addClass('selected');
      this.topBarView = new TopBarView({model: this.model});
    }else{
      if(!this.tab || this.tab === 'edit'){
        this.tab = 'wizard';
      }
      this.$el.find('.top-menu-' + this.tab).addClass('selected');
      this.topBarView = new TopBarView({bar: this.tab});
    }

    this.listenTo(designer.objectList, 'select', this.changeSelect);
  },

  modelDelete: function(){
    this.model = null;
    this.changeTab(0);
  },

  click: function(e){
    switch(e.target.className){
      case 'top-menu-wizard':
        this.changeTab(0);
        break;
      case 'top-menu-image':
        this.changeTab(1);
        break;
      case 'top-menu-text':
        this.changeTab(2);
        break;
      case 'top-menu-decoration':
        this.changeTab(3);
        break;
      case 'top-menu-edit':
        this.changeTab(4);
        break;
      case 'top-menu-finish':
        this.changeTab(5);
        break;
    }
  },


  changeTab: function(tab){
    switch(tab){
      case(0):
        this.tab = 'wizard';
        break;
      case(1):
        this.tab = 'image';
        break;
      case(2):
        this.tab = 'text';
        break;
      case(3):
        this.tab = 'decoration';
        break;
      case(4):
        this.tab = 'edit';
        break;
      case(5):
        this.tab = 'finish';
        break;
    }
    this.stopListening();
    this.initialize();
  },

  changeModel: function(model){
    this.stopListening();
    this.tab = 'edit';
    this.model = model;
    this.initialize();
  },

  changeSelect: function(model, selected){
    if(selected){
      this.changeModel(model);
    }else{
      this.stopListening();
      this.model = null;
      this.initialize();
    }
  }
});