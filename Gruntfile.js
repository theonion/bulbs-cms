'use strict';

module.exports = function (grunt) {
  // time how long grunt tasks take
  require('time-grunt')(grunt);

  var path = require('path');

  var config = grunt.util._.extend(
    require('./tasks/config'),
    require('load-grunt-config')(grunt, {
      configPath: path.join(process.cwd(), 'tasks/options'),
      init: false
    })
  );

  grunt.initConfig(config);

  grunt.log.writeln('Environment: ' + config.environment());

  grunt.loadTasks('tasks');

  grunt.registerTask('serve', function (target) {

    if (target === 'dist') {
      // use built files in dist instead of raw files
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    // run task list
    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'injector:less_components',
      'less',
      'autoprefixer',
      'injector:local_dependencies',
      'karma:ci',
      'jshint:all',
      'connect:livereload',
      'watch:livereload'
    ]);
  });

  grunt.registerTask('serve-no-test', function (target) {

    if (target === 'dist') {
      // use built files in dist instead of raw files
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    // run task list
    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'injector:less_components',
      'less',
      'autoprefixer',
      'injector:local_dependencies',
      'connect:livereload',
      'watch:livereload'
    ]);
  });

  grunt.registerTask('lint', [
    'jshint:all'
  ]);

  grunt.registerTask('test', [
    'travis',
    'protractor'
  ]);

  grunt.registerTask('travis', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma:ci'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'shell:bower_install',
    'shell:bower_update',
    'wiredep',
    'ngtemplates',
    'injector:less_components',
    'less',
    'injector:local_dependencies',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngmin',
    'copy:dist',
    'copy:jcropGif',
    'copy:bootstrapFonts',
    'copy:fontawesome',
    'copy:fontawesomeCSS',
    'copy:zeroclipboard',
    'cdnify',
    'cssmin',
    'uglify'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
