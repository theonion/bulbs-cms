/**
 * JSHint linting.
 */
'use strict';

var config = require('../config');

module.exports = {
  options: {
    jshintrc: '.jshintrc',
    reporter: require('jshint-stylish')
  },
  all: [
    'Gruntfile.js',
    config.paths.app + '/components/**/*.js',
    config.paths.app + '/shared/**/*.js',
    config.paths.app + '/scripts/{,*/}*.js'
  ],
  test: {
    options: {
      jshintrc: 'test/.jshintrc'
    },
    src: ['test/spec/{,*/}*.js']
  }
};
