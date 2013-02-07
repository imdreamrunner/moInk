var AppView = Backbone.View.extend({
  // The main view, the instance of which will be created when the web page is loaded.

  el: '#designer',

  events: {
    'click': 'click'
  },

  initialize: function(){
    designer.objectList = new ObjectList();

    designer.topMenuView = new TopMenuView();
    designer.panelView = new PanelView();
    designer.objectListView = new ObjectListView();

    if(!designId){
      /* Develop Information */
      designer.objectList.add({
        name: 'Background',
        type: 'shape',
        shape: 'rect',
        x: 0,
        y: 0,
        width: 1748,
        height: 1240,
        color: '#fefbd2'
      });

      designer.objectList.add({
        name: 'Cats',
        type: 'image',
        x: 100,
        y: 200,
        width: 766,
        height: 861,
        source: '_devimg/cats.png'
      });

      designer.objectList.add({
        name: 'Words',
        type: 'text',
        fontFamily: 'Nunito',
        text: 'Love is\nhaving someone to do things with.',
        x: 982,
        y: 472,
        color: "#bc794d",
        fontSize: 44
      });
    }else{
      var loadContent = function(res){
        designer.design = res.design;
        if(designer.design.content && designer.design.content != ''){
          var content = JSON.parse(designer.design.content);
          _.each(content, function(object){
            designer.objectList.add(object);
          });
        }
      }
      $.ajax({
        type: "POST",
        url: DESIGNER_URL + 'get',
        data: {
          id: designId
        },
        success: loadContent
      });
    }
  },

  click: function(e){
    if(e.target.id === 'designer'){
      designer.objectList.unSelectAll();
    }
  }
});