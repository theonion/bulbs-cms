/**
 * Run tasks in parallel to speed up build process.
 */
'use strict';

module.exports = {
  server: [
    'copy:styles'
  ],
  test: [
    'copy:styles'
  ],
  dist: [
    'copy:styles',
    'imagemin',
    'svgmin'
  ]
};
