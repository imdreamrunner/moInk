var TopBarView = Backbone.View.extend({
  el: '#top-bar',

  events: {

  },

  offset: {
    right: 141
  },

  initialize: function(){
    this.pageWidth = document.documentElement.clientWidth;
    this.$el.css({
      width: parseInt(this.pageWidth - this.offset.right)
    });
    if(this.model){
      console.log(this.model);
      var type = this.model.get('type');
      var modelTemplate = _.template($('#top-menu-edit-' + type + '-template').html());
      this.$el.html(modelTemplate(this.model.toJSON()));
      if(type === 'image'){
        this.imageBarInitialize();
      }else if(type === 'text'){
        this.textBarInitialize();
      }else if(type === 'shape'){
        this.shapeBarInitialize();
      }
    }else if(this.options.bar){
      var barTemplate = _.template($('#top-menu-' + this.options.bar + '-template').html());
      this.$el.html(barTemplate());
      if(this.options.bar === 'text'){
        this.textBar();
      }else if(this.options.bar === 'decoration'){
        this.decorationBar();
      }else if(this.options.bar === 'image'){
        this.imageBar();
      }else if(this.options.bar === 'wizard'){
        this.wizardBar();
      }
    }
  },

  /* for default bar */

  wizardBar : function(){
    this.$el.find('.to-json').click(function(){
      var postSuccess = function(res){
        //console.log(res);
        $('.ul-top-bar').append('<img src="' + res + '" />');
      };

      $.ajax({
        type: "POST",
        url: DESIGNER_URL + 'getPic',
        data: {
          content: JSON.stringify(designer.objectList.toJSON())
        },
        success: postSuccess
      });
    });

    this.$el.find('.save').on('click', function(){
      var postSuccess = function(res){
        console.log(res);
      };

      $.ajax({
        type: "POST",
        url: DESIGNER_URL + 'save',
        data: {
          id: designId,
          content: JSON.stringify(designer.objectList.toJSON())
        },
        success: postSuccess
      });
    });
  },

  textBar: function(){
    _.bindAll(this, 'addText');
    this.$el.find('.add-text').on('click', this.addText);
  },

  decorationBar: function(){
    _.bindAll(this, 'addWhole', 'addRectangle');
    this.$el.find('.add-whole').on('click', this.addWhole);
    this.$el.find('.add-rectangle').on('click', this.addRectangle);
  },

  imageBar: function(){
    _.bindAll(this, 'addImage');
    this.$el.find('.add-image').on('click', this.addImage);
  },

  /* common methods for top bar */

  addObject: function(model){
    designer.objectList.add(model);
    var unSelect = function(model){
      model.set({_selected: false});
    };
    _.each(designer.objectList.selected(), unSelect);
    model.set({_selected: true});
  },

  addText: function(){
    var newText = new PanelObject({
      name: 'New Text',
      type: 'text',
      fontFamily: 'Nunito',
      text: 'Your text here :)',
      color: "#000000",
      fontSize: 44
    });
    this.addObject(newText);
  },

  addWhole: function(){
    var newShape = new PanelObject({
      name: 'New Shape',
      type: 'shape',
      shape: 'rect',
      x: 0,
      y: 0,
      width: designer.width,
      height: designer.height,
      color: '#757270'
    });
    this.addObject(newShape);
  },

  addRectangle: function(){
    var newShape = new PanelObject({
      name: 'New Shape',
      type: 'shape',
      shape: 'rect',
      width: 100,
      height: 100,
      color: '#757270'
    });
    this.addObject(newShape);
  },

  addImage: function(){
    var _this = this;
    /*
    var newImage = new PanelObject({
      name: 'New Image',
      type: 'image',
      source: '_devimg/cats.png'
    });
    this.addObject(newImage);
    */
    var imageBox = new moBox({
      width: 500,
      height: 300,
      content: $('#box-newImage-template').html()
    });
    imageBox.$el.find('.cancel').click(function(){
      imageBox.close();
    });
    imageBox.$el.find('.get-image').click(function(){
      /*
      imageBox.imageObject = new Image();
      imageBox.imageObject.onload = function(){
        console.log('new image loaded');
        imageBox.$el.find('.image-container').html(imageBox.imageObject);
      };
      imageBox.imageObject.src = imageBox.$el.find('.url').val();
      */
      loadImage(imageBox.$el.find('.url').val(), function(canvas){
        imageBox.$el.find('.image-container').html(canvas);
      }, {
        canvas: true
      });
    });

    var inseartImage = function(res){
      var attachment = res.attachment;
      console.log(attachment);
      var newImage = new PanelObject({
        name: attachment.url.split('/').pop().split('.')[0],
        type: 'image',
        attachment: attachment._id + '.' + attachment.url.split('.').pop()
      });
      _this.addObject(newImage);
      imageBox.close();

    };

    imageBox.$el.find('.insert-image').click(function(){
      $.ajax(DESIGNER_URL + 'image/getFromURL', {
        type: 'POST',
        data: {
          id: designId,
          url: imageBox.$el.find('.url').val()
        },
        success: inseartImage
      });
    });
    imageBox.$el.find('.uploadForm').submit(function(){
      $(this).ajaxSubmit({
        url: DESIGNER_URL + 'image/upload',
        data: {
          id: designId
        },
        error: function(xhr) {
          console.log('Error: ' + xhr.status);
        },
        success: inseartImage
      });
      return false;
    });
    imageBox.show();
  },


  /* common methods */

  position: function(){
    this.$el.find('.x').val(this.model.get('x'));
    this.$el.find('.y').val(this.model.get('y'));
  },

  positionChange: function(){
    _.bindAll(this, 'positionChangeHandler');
    this.$el.find('.x').add(this.$el.find('.y')).on('change', this.positionChangeHandler);
  },

  positionChangeHandler: function(){
    this.model.set({
      x: parseInt(this.$el.find('.x').val()),
      y: parseInt(this.$el.find('.y').val())
    });
  },

  size: function(){
    this.$el.find('.width').val(this.model.get('width'));
    this.$el.find('.height').val(this.model.get('height'));
  },

  sizeChange: function(){
    _.bindAll(this, 'sizeChangeHandler');
    this.$el.find('.width').add(this.$el.find('.height')).on('change', this.sizeChangeHandler);
  },

  sizeChangeHandler: function(){
    this.model.set({
      width: parseInt(this.$el.find('.width').val()),
      height: parseInt(this.$el.find('.height').val())
    });
  },

  color: function(){
    //this.$el.find('.color').val(this.model.get('color'));
    this.$el.find('.color').spectrum({
      color: this.model.get('color'),
      showInitial: true,
      showInput: true
    });
  },

  colorChange: function(){
    _.bindAll(this, 'colorChangeHandler');
    this.$el.find('.color').on('change', this.colorChangeHandler);
  },

  colorChangeHandler: function(){
    this.model.set({
      color: this.$el.find('.color').val()
    });
  },

  font: function(){
    this.$el.find('.fontFamily').val(this.model.get('fontFamily'));
    this.$el.find('.fontSize').val(this.model.get('fontSize'));
  },

  fontChange: function(){
    _.bindAll(this, 'fontChangeHandler');
    this.$el.find('.fontFamily').add(this.$el.find('.fontSize')).on('change', this.fontChangeHandler);
  },

  fontChangeHandler: function(){
    this.model.set({
      fontFamily: this.$el.find('.fontFamily').val(),
      fontSize: this.$el.find('.fontSize').val()
    });
  },

  text: function(){
    this.$el.find('.text').val(this.model.get('text'));
  },

  textChange: function(){
    _.bindAll(this, 'textChangeHandler');
    this.$el.find('.text').on('change', this.textChangeHandler);
  },

  textChangeHandler: function(){
    this.model.set({
      text: this.$el.find('.text').val()
    });
  },

  crop: function(){
    if(this.model.get('_cropping')){
      this.$el.find('.crop').val('Cropping');
    }else{
      this.$el.find('.crop').val('Crop');
    }
  },

  cropChange: function(){
    _.bindAll(this, 'cropChangeHandler');
    this.$el.find('.crop').on('click', this.cropChangeHandler);
  },

  cropChangeHandler: function(){
    this.model.set({
      _cropping: !this.model.get('_cropping')
    });
  },

  /* methods for bar */

  imageBarInitialize: function(){
    this.listenTo(this.model, 'change', this.imageBarChange);
    this.imageBarChange();

    this.positionChange();
    this.sizeChange();
    this.cropChange();
  },

  imageBarChange: function(){
    this.position();
    this.size();
    this.crop();
  },

  textBarInitialize: function(){
    this.listenTo(this.model, 'change', this.textBarChange);
    this.textBarChange();

    this.positionChange();
    this.fontChange();
    this.colorChange();
    this.textChange();
  },

  textBarChange: function(){
    this.position();
    this.font();
    this.color();
    this.text();
  },

  shapeBarInitialize: function(){
    this.listenTo(this.model, 'change', this.shapeBarChange);
    this.shapeBarChange();

    this.positionChange();
    this.sizeChange();
    this.colorChange();
  },

  shapeBarChange: function(){
    this.position();
    this.size();
    this.color();
  },

  close: function(){
    this.off();
    this.stopListening();
    $('.sp-container').remove(); /* for Spectrum Colorpicker */
    this.$el.html('');
  }
});