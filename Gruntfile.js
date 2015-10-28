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
      'ngtemplates:tmp',
      'wiredep',
      'concurrent:server',
      'injector:less_components',
      'less:project_styles',
      'copy:static_tmp',
      'copy:font_awesome_fonts_tmp',
      'copy:font_awesome_less_tmp_styles',
      'less:font_awesome_styles',
      'autoprefixer',
      'injector:local_dependencies',
      'jshint:all',
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
    'ngtemplates:dist',
    'injector:less_components',
    'less:project_styles',
    'copy:font_awesome_less_tmp_styles',
    'less:font_awesome_styles',
    'injector:local_dependencies',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngmin',
    'copy:dist',
    'copy:jcropGif',
    'copy:font_awesome_fonts_dist',
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

  var shell = require('shelljs');

  grunt.registerTask('commitBuild', function () {
    var stdout = shell.exec('git add dist/scripts/scripts.min.js.*.map dist/scripts/templates.js.*.map;' +
                            'git commit -am \'new build\'',
      {silent: true});
    grunt.log.ok(stdout.output);
  });

  grunt.registerTask('publish', function (release_args) {
    var branch = shell.exec(
      'git symbolic-ref --short HEAD',
      { silent: true }
    ).output.trim();

    if (branch === 'release') {

      var release = 'release';
      if (arguments.length) {
        release += ':' + release_args;
      }

      grunt.task.run([
        'travis',
        'build',
        'commitBuild',
        release
      ]);

    } else {
      grunt.fail.fatal('You\'re not on the \"release\" branch!');
    }

  });
};
