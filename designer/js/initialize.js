/*
 This file will be run before all other classes.
 */

var designer = {};

var DESIGNER_URL = '/designer/';

function loading_status(message) {
  $('#loader').find('.status').html(message);
}

function loaded() {
  loading_status("starting designer...");
  $('#loader').delay(500).fadeOut(1000);
  setTimeout(function() {
    $('#loader').remove();
  }, 4000);
}

var templateList = [
  'templates',
  'moBox',
  'box.newImage',
  'TopBar'
];

var ModuleList = [
  'libs/underscore',
  'libs/backbone',
  //'plugins/backbone.localStorage',
  'plugins/backbone.validation',
  'plugins/jquery.form',
  'plugins/jquery.rotate',
  'plugins/jquery.selectLess',
  'plugins/spectrum',
  'plugins/moBox',
  'plugins/load-image',
  'models/Object',
  'collections/ObjectList',
  'views/AppView',
  'views/CropperView',
  'views/ObjectListItemView',
  'views/ObjectListView',
  'views/PanelHoverView',
  'views/PanelObjectView',
  'views/PanelSelectedView',
  'views/PanelView',
  'views/TopBarView',
  'views/TopMenuView'
];

var initialize = function() {
  loading_status('loading panel core...');
  $.ajax('templates/main.html', {
    success: function(content) {
      $('body').prepend(content);
      loadTemplates(templateList);
    }
  });
};

var loadTemplates = function(templates) {
  loading_status('loading panel templates...');
  $.ajax('templates/' + templates[0] + '.html', {
    success: function(content) {
      $('body').append(content);
      templates.shift();
      if (templates.length) {
        loadTemplates(templates);
      } else {
        loadWebFont();
      }
    }
  });
};

var loadWebFont = function() {
  loading_status('loading fonts...');
  $.loadScript(DESIGNER_URL + 'js/libs/webfont.js', function() {
    WebFont.load({
      custom: { families: ['Nunito', 'Nunito Light'],
        urls: ['fonts/Nunito.css', 'fonts/NunitoLight.css']
      },
      loading: function() {
        console.log("Loading fonts...");
      },
      active: function() {
        console.log('Fonts are loaded.');
        loadModule(ModuleList, startApp);
      },
      inactive: function() {
        console.log("Failed to load fonts.");
      }
    });
  });
};

var loadModule = function(modules, callback) {
  loading_status('loading module ' + modules[0] + '...');
  $.loadScript(DESIGNER_URL + 'js/' + modules[0] + '.js', function(res) {
    modules.shift();
    if (modules.length > 0) {
      loadModule(modules, callback);
    } else {
      callback();
    }
  });
};

var startApp = function() {
  loading_status('designer is loaded...');
  designer.appView = new AppView();
};

window.onload = initialize;