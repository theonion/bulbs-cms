/**
 * Minify SVGs.
 */
'use strict';

var config = require('../config');

module.exports = {
  dist: {
    files: [{
      expand: true,
      cwd: config.paths.app + '/images',
      src: '{,*/}*.svg',
      dest: config.paths.dist + '/images'
    }]
  }
};
