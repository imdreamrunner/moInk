var moBox = function(settings){
  this.initialize(settings);
};

moBox.prototype = {
  initialize: function(settings){
    if(!settings){
      settings = {};
    }
    this.settings = settings;
    this.$el = $("<div id='moBox'>");
    this.$el.css({
      marginLeft: - (settings.width||500) / 2,
      width: settings.width||500,
      height: settings.height || 300
    });
    this.$el.html($('#moBox-template').html());
    if(this.settings.content){
      this.$el.find('.content').append(this.settings.content);
    }
  },

  show: function(){
    this.bg = $('<div id="moBoxBg"></div>');
    this.bgTop = $('<div id="moBoxBgTop"></div>');
    $('body').prepend(this.bg).prepend(this.bgTop).prepend(this.$el);
  },

  close: function(){
    this.$el.remove();
    this.bg.remove();
    this.bgTop.remove();
  }
}