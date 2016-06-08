/**
 * Watch directories for changes and redo tasks, livereload.
 */
'use strict';

var config = require('../config');

var files = [
  config.paths.app + '/{,*/}*.html',
  config.paths.app + '/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
  config.paths.app + '/scripts/**/*.js',
  config.paths.app + '/components/**/*.{html,js,less}',
  config.paths.app + '/shared/**/*.{html,js,less}',
  'test/spec/{,*/}*.js',
  'Gruntfile.js',
  config.paths.app + '/styles/**/*.less',
  '!' + config.paths.app + '/styles/_mixins.less',
  '!' + config.paths.app + '/styles/_components.less',
  '!' + config.paths.app + '/styles/_shared.less'
];

module.exports = {
  options: {
    livereload: config.const.LIVERELOAD_PORT
  },
  livereload: {
    files: files,
    tasks: [
      'injector:less_components',
      'less',
      'newer:karma:ci',
      'newer:jshint:all',
      'injector:local_dependencies'
    ]
  },
  livereloadNoTest: {
    files: files,
    tasks: [
      'injector:less_components',
      'less',
      'injector:local_dependencies'
    ]
  }
};
