/**
 * Creates cachable templates js file for quick template access.
 */
'use strict';

var config = require('../config');

module.exports = {
  options: {
    url: function (url) {
      return '/' + url;
    },
    htmlmin: {
      collapseBooleanAttributes:      true,
      collapseWhitespace:             true,
      removeAttributeQuotes:          true,
      removeComments:                 true,
      removeEmptyAttributes:          true,
      removeRedundantAttributes:      true,
      removeScriptTypeAttributes:     true,
      removeStyleLinkTypeAttributes:  true
    },
    module: 'cms.templates',
    standalone: true
  },
  tmp: {
    cwd: config.paths.app(),
    src: [
      'views/{,*/}*.html',
      'components/**/*.html',
      'shared/**/*.html',
      '404.html',
      'content_type_views/*.html'
    ],
    dest: config.paths.tmp('scripts/templates.js')
  },
  dist: {
    cwd: config.paths.app(),
    src: [
      'views/{,*/}*.html',
      'components/**/*.html',
      'shared/**/*.html',
      '404.html',
      'content_type_views/*.html'
    ],
    dest: config.paths.tmp('concat/scripts/templates.js')
  }
};
