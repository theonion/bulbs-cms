/**
 * Places style and script file references into HTML files.
 */
'use strict';

var config = require('../config');

module.exports = {
  html: config.paths.dist('{,*/}*.html'),
  css: config.paths.dist('{,*/}*.css'),
  options: {
    assetsDirs: [config.paths.dist()]
  }
};
