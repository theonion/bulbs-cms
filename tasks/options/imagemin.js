/**
 * Create minified images.
 */
'use strict';

var config = require('../config');

module.exports = {
  dist: {
    files: [{
      expand: true,
      cwd: config.paths.app('images'),
      src: '{,*/}*.{png,jpg,jpeg,gif}',
      dest: config.paths.dist('images')
    }]
  }
};
