/**
 * Renames files for browser caching purposes.
 */
'use strict';

var config = require('../config');

module.exports = {
  dist: {
    files: {
      src: [
        config.paths.dist + '/components/**/*.{js,css}',
        config.paths.dist + '/shared/**/*.{js,css}',
        config.paths.dist + '/scripts/{,*/}*.js',
        config.paths.dist + '/styles/{,*/}*.css',
        config.paths.dist + '/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
        config.paths.dist + '/styles/fonts/*',
        '!**/*.tests.js',
      ]
    }
  }
};
