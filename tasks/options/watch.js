/**
 * Watch directories for changes and redo tasks, livereload.
 */
'use strict';

var config = require('../config');

module.exports = {
  options: {
    livereload: config.const.LIVERELOAD_PORT
  },
  livereload: {
    files: [
      config.paths.app('{,*/}*.html'),
      config.paths.app('images/**/*.{png,jpg,jpeg,gif,webp,svg}'),
      config.paths.app('scripts/**/*.js'),
      config.paths.app('components/**/*.{html,js,less}'),
      config.paths.app('shared/**/*.{html,js,less}'),
      'test/spec/{,*/}*.js',
      'Gruntfile.js',
      config.paths.app('styles/**/*.less'),
      '!' + config.paths.app('styles/_mixins.less'),
      '!' + config.paths.app('styles/_components.less'),
      '!' + config.paths.app('styles/_shared.less')
    ],
    tasks: [
      'injector:less_components',
      'less:project_styles',
      'copy:font_awesome_less_tmp_styles',
      'less:font_awesome_styles',
      'newer:karma:ci',
      'newer:jshint:all',
      'injector:local_dependencies',
      'ngtemplates:tmp'
    ]
  }
};
