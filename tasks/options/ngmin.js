/**
 * Makes angular modules safe for minification.
 */
'use strict';

var config = require('../config');

module.exports = {
  templates: {
    files: [{
      expand: true,
      cwd: config.paths.tmp('concat/scripts'),
      src: '*.js',
      dest: config.paths.tmp('concat/scripts')
    }]
  },
  dist: {
    files: [{
      expand: true,
      cwd: config.paths.dist('scripts'),
      src: '*.js',
      dest: config.paths.tmp('concat/scripts')
    }]
  }
};
