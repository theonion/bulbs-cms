/**
 * Inject source references.
 */
'use strict';

var config = require('../config');
var path = require('path');

module.exports = {
  options: {
    addRootSlash: false,
  },
  less_components: {
    files: [{
      dest: config.paths.app + '/styles/_components.less',
      src: [config.paths.app + '/components/**/*.less']
    }, {
      dest: config.paths.app + '/styles/_shared.less',
      src: [config.paths.app + '/shared/**/*.less'],
    }],
    options: {
      endtag: '// endinjector:less_components',
      sort: function (a, b) {
        return a < b;
      },
      starttag: '// injector:less_components',
      transform: function (filepath) {
        filepath = filepath.replace(/app\//, '../');
        return '@import "' + filepath + '";';
      }
    }
  },
  local_dependencies: {
    files: [{
      dest: config.paths.app + '/index.html', 
      src: [
        '.tmp/styles/*.css',
        config.paths.app + '/components/**/*.js',
        config.paths.app + '/shared/**/*.js',
        config.paths.app + '/scripts/directives/*.js',
        config.paths.app + '/scripts/directives/autocomplete/*.js',
        config.paths.app + '/scripts/controllers/*.js',
        config.paths.app + '/scripts/services/*.js',
        config.paths.app + '/scripts/filters/*.js',
        '!**/*.tests.js'
      ],
    }],
    options: {
      transform: function (filepath) {
        filepath = filepath.replace(/app\/|.tmp\//i, '');
        var e = path.extname(filepath).slice(1);
        if (e === 'css') {
          return '<link rel="stylesheet" href="' + filepath + '">';
        } else if (e === 'js') {
          return '<script src="' + filepath + '"></script>';
        } else if (e === 'html') {
          return '<link rel="import" href="' + filepath + '">';
        }
      }
    }
  }
};
