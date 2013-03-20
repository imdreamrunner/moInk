var AppView = Backbone.View.extend({
  // The main view, the instance of which will be created when the web page is loaded.

  el: '#designer',

  events: {
    'click': 'click'
  },

  initialize: function () {
    loading_status("loading design...");
    var _this = this;
    var loadContent = function (res) {
      designer.design = res.design;

      var settings = JSON.parse(designer.design.settings || '[]');

      designer.width = settings.width || 1748;
      designer.height = settings.height || 1240;

      /* Initialize */
      designer.objectList = new ObjectList();
      designer.topMenuView = new TopMenuView();
      designer.panelView = new PanelView();
      designer.objectListView = new ObjectListView();
      designer.panelHoverView = new PanelHoverView();
      designer.panelSelectView = new PanelSelectedView();
      designer.cropperView = new CropperView();

      if (designer.design.content && designer.design.content != '') {
        var content = JSON.parse(designer.design.content);
        _.each(content, function (object) {
          designer.objectList.add(object);
        });
      }
      loaded();
      _this.initializeSaving();
    };
    $.ajax({
      type: "POST",
      url: DESIGNER_URL + 'get',
      data: {
        id: designId
      },
      success: loadContent
    });
    /* Develop Information */
    /*
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
     */
  },

  click: function (e) {
    if (e.target.id === 'designer') {
      designer.objectList.unSelectAll();
    }
  },

  initializeSaving: function () {
    var _this = this;
    this.$el.find('#top-menu-save').on('click', function () {
      var postSuccess = function (res) {
        console.log(res);
        if (res.err) {
          alert(res.msg);
        } else {
          alert('success!');
        }
      };

      _this.saveAll(postSuccess);

    });
  },

  saveAll: function (callback) {
    designer.objectList.unSelectAll();
    $.ajax({
      type: "POST",
      url: DESIGNER_URL + 'save',
      data: {
        id: designId,
        title: designer.design.title,
        content: JSON.stringify(designer.objectList.toJSON()),
        settings: JSON.stringify({
          width: designer.width,
          height: designer.height
        })
      },
      success: callback
    });
  }
});