/*
 This file will be run before all other classes.
 */

var designer = {};

var DESIGNER_URL = '/designer/';

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

var initialize = function () {
  $.ajax('templates/main.html', {
    success: function (content) {
      $('body').prepend(content);
      console.log('Panel content is loaded.')
      loadTemplates(templateList);
    }
  });
};

var loadTemplates = function (templates) {
  $.ajax('templates/' + templates[0] + '.html', {
    success: function (content) {
      $('body').append(content);
      templates.shift();
      if (templates.length) {
        loadTemplates(templates);
      } else {
        console.log('Templates are loaded.');
        loadWebFont();
      }
    }
  });
};

var loadWebFont = function () {
  $.loadScript(DESIGNER_URL + 'js/libs/webfont.js', function () {
    WebFont.load({
      custom: { families: ['Nunito', 'Nunito Light', 'Lustria'],
        urls: ['fonts/Nunito.css', 'fonts/NunitoLight.css', 'fonts/Lustria.css']
      },
      loading: function () {
        console.log("Loading fonts...");
      },
      active: function () {
        console.log('Fonts are loaded.');
        loadModule(ModuleList, startApp);
      },
      inactive: function () {
        console.log("Failed to load fonts.");
      }
    });
  });
};

var loadModule = function (modules, callback) {
  $.loadScript(DESIGNER_URL + 'js/' + modules[0] + '.js', function (res) {
    //console.log(modules[0] + ' is loaded.')
    modules.shift();
    if (modules.length > 0) {
      loadModule(modules, callback);
    } else {
      callback();
    }
  });
};

var startApp = function () {
  console.log('All modules are loaded.');
  $('#loading').remove();
  designer.appView = new AppView();
};

$(document).ready(initialize);