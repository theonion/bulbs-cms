/**
 * Minify HTML.
 */
'use strict';

var config = require('../config');

module.exports = {
  dist: {
    options: {
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeCommentsFromCDATA: true,
      removeOptionalTags: true
    },
    files: [{
      expand: true,
      cwd: config.paths.dist(),
      src: ['*.html', 'views/{,*/}*.html'],
      dest: config.paths.dist()
    }]
  }
};
