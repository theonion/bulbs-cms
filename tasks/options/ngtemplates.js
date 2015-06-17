/**
 * Creates cachable templates js file for quick template access.
 */
'use strict';

var config = require('../config');

module.exports = {
  bulbsCmsApp: {
    cwd: config.paths.app,
    src: [
      'views/{,*/}*.html',
      'components/**/*.html',
      'shared/**/*.html'
    ],
    dest: '.tmp/concat/scripts/templates.js',
    options: {
      url:    function (url) { return '/' + url; },
      htmlmin: {
        collapseBooleanAttributes:      true,
        collapseWhitespace:             true,
        removeAttributeQuotes:          true,
        removeComments:                 true,
        removeEmptyAttributes:          true,
        removeRedundantAttributes:      true,
        removeScriptTypeAttributes:     true,
        removeStyleLinkTypeAttributes:  true
      }
    }
  }
};
