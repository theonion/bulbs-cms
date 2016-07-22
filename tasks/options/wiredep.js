/**
 * Injector for bower dependencies.
 */
'use strict';

var config = require('../config');

module.exports = {
  app: {
    src: [config.paths.app + '/index.html'],
    ignorePath: config.paths.app + '/',
    devDependencies: true,
    overrides: {
      'angular-restmod': {
        'main': [
          './dist/angular-restmod-bundle.js',
          './dist/plugins/nested-dirty.js'
        ]
      },
      bootstrap: {
        main: [
          './dist/css/bootstrap.css',
          './dist/js/bootstrap.js'
        ]
      },
      jcrop: {
        main: [
          './js/jquery.Jcrop.js',
          './css/jquery.Jcrop.css'
        ]
      },
      'moment-timezone': {
        main: './builds/moment-timezone-with-data.js'
      },
      'onion-editor': {
        'main': [
          './build/editor-main.css',
          './build/onion-editor.js'
        ]
      }
    }
  },
};
