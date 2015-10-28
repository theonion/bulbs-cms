/**
 * Prepare usemin.
 */
'use strict';

var config = require('../config');

module.exports = {
  html: config.paths.app('index.html'),
  options: {
    dest: config.paths.dist(),
    flow: {
      steps: {
        'js': ['concat'],
        'css': ['concat', 'cssmin'],
      },
      post: {}
    }
  }
};
