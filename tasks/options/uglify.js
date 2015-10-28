/**
 * Minification.
 */
'use strict';

var config = require('../config');

module.exports = {
  options: {
    mangle: false, //https://github.com/theonion/bulbs-cms/issues/4
    sourceMap: true,
    sourceMapName: function (path) {
      return path + '.' + Date.now() + '.map';
    }
  },
  dist: {
    files: [{
      dest: config.paths.dist('scripts/templates.js'),
      src: config.paths.tmp('concat/scripts/templates.js')
    }, {
      dest: config.paths.dist('scripts/scripts.min.js'),
      src: config.paths.dist('scripts/scripts.js')
    }]
  }
};
