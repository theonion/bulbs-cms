/**
 * Watch directories for changes and redo tasks, livereload.
 */
'use strict';

module.exports = {
  options: {
    livereload: '<%= connect.options.livereload %>'
  },
  livereload: {
    files: [
      '<%= config.app %>/{,*/}*.html',
      '<%= config.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
      '<%= config.app %>/scripts/**/*.js',
      '<%= config.app %>/components/**/*.{html,js,less}',
      '<%= config.app %>/shared/**/*.{html,js,less}',
      'test/spec/{,*/}*.js',
      'Gruntfile.js',
      'app/styles/**/*.less',
      '!app/styles/_mixins.less',
      '!app/styles/_components.less',
      '!app/styles/_shared.less'
    ],
    tasks: [
      'injector:less_components',
      'less',
      'newer:karma:ci',
      'newer:jshint:all',
      'injector:local_dependencies'
    ]
  }
};
