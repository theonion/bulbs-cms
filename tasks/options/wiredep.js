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
      'onion-editor': {
        'main': [
          './build/editor-main.css',
          './build/onion-editor.js'
        ]
      }
    }
  },
};
