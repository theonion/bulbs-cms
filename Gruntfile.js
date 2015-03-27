// Generated on 2014-02-26 using generator-angular 0.7.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

var LIVERELOAD_PORT = 35729;
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var modRewrite = require('connect-modrewrite');
  var path = require('path');

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/styles/{,*/}*.less',
          '<%= yeoman.app %>/{,*/}*.html',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.app %>/scripts/{,*/}*.js',
          '<%= yeoman.app %>/components/**/*.{html,js,less}',
          '<%= yeoman.app %>/shared/{,*/}*.{html,js,less}',
          'test/spec/{,*/}*.js',
          'Gruntfile.js'
        ],
        tasks: [
          'newer:less',
          'newer:karma:ci',
          'newer:jshint:all',
          'injector:local_dependencies'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9069,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0',
        livereload: LIVERELOAD_PORT
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= yeoman.app %>'
          ],
          middleware: function (connect) {
            return [
              modRewrite([
                '!\\.eot|\\.woff|\\.woff2\\.ttf|\\.svg|\\.html|\\.js|\\.css|\\.swf|\\.jp(e?)g|\\.png|\\.gif$ /index.html'
              ]),
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'app')
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/components/**/*.js',
        '<%= yeoman.app %>/shared/**/*.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    shell: {
      bower_install: {
        command: 'bower install -F --production'
      },
      bower_update: {
        command: 'bower update -F --production'
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= yeoman.app %>/index.html'],
        ignorePath: '<%= yeoman.app %>/',
        devDependencies: true,
        overrides: {
          'angular-restmod': {
            'main': [
              './dist/angular-restmod-bundle.js',
              './dist/plugins/nested-dirty.js'
            ]
          },
          'onion-editor': {
            'main': [
              './build/editor-main.css',
              './build/onion-editor.js'
            ]
          }
        }
      },
    },

    less: {
      development: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: [
            'styles/{,*/}*.less',
            'components/**/*.less'
          ],
          dest: '.tmp/',
          ext: '.css'
        }]
      },
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/components/**/*.{js,css}',
            '<%= yeoman.dist %>/shared/**/*.{js,css}',
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*',
            '!**/*.tests.js',
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          steps: {
            'js': ['concat'],
            'css': ['concat', 'cssmin'],
          },
          post: {}
        }
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: [
        '<%= yeoman.dist %>{,*/}*.css'
      ],
      options: {
        assetsDirs: ['<%= yeoman.dist %>']
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html', 'views/{,*/}*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngmin: {
      templates: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'images/{,*/}*.{webp}',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: ['generated/*']
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      },
      jcropGif: {
        expand: true,
        cwd: '<%= yeoman.app %>/bower_components/jcrop/css',
        dest: '<%= yeoman.dist %>/styles/',
        src: 'Jcrop.gif'
      },
      bootstrapFonts: {
        expand: true,
        cwd: '<%= yeoman.app %>/bower_components/bootstrap/dist/fonts',
        dest: '<%= yeoman.dist %>/fonts/',
        src: ['glyphicons-halflings-regular.*', 'glyphicons-halflings-regular.woff2']
      },
      fontawesome: {
        expand: true,
        cwd: '<%= yeoman.app %>/bower_components/font-awesome/fonts',
        dest: '<%= yeoman.dist %>/fonts/',
        src: ['fontawesome-webfont.*']
      },
      fontawesomeCSS: {  // This is a hack for now. FontAwesome REALLY doesn't like getting minified, I guess.
        expand: true,
        cwd: '<%= yeoman.app %>/bower_components/font-awesome/css',
        dest: '<%= yeoman.dist %>/styles/',
        src: ['font-awesome.min.css']
      },
      zeroclipboard: {
        expand: true,
        cwd: '<%= yeoman.app %>/bower_components/zeroclipboard/dist',
        dest: '<%= yeoman.dist %>/swf/',
        src: ['ZeroClipboard.swf']
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles',
        'imagemin',
        'svgmin'
      ]
    },

    coveralls: {
      options: {
        debug: true,
        coverage_dir: 'coverage',
        force: true,
        recursive: true
      }
    },

    injector: {
      options: {
        addRootSlash: false,
        transform: function (filepath) {
          filepath = filepath.replace(/app\/|.tmp\//i, '');
          var e = path.extname(filepath).slice(1);
          if (e === 'css') {
            return '<link rel="stylesheet" href="' + filepath + '">';
          } else if (e === 'js') {
            return '<script src="' + filepath + '"></script>';
          } else if (e === 'html') {
            return '<link rel="import" href="' + filepath + '">';
          }
        }
      },
      local_dependencies: {
        files: {
          'app/index.html': [
            '.tmp/components/**/*.css',
            'app/components/**/*.js',
            'app/shared/**/*.js',
            'app/scripts/directives/*.js',
            'app/scripts/directives/autocomplete/*.js',
            'app/scripts/controllers/*.js',
            'app/scripts/services/*.js',
            'app/scripts/filters/*.js',
            '!**/*.tests.js'
          ],
        }
      }
    },

    uglify: {
      options: {
        mangle: false, //https://github.com/theonion/bulbs-cms/issues/4
        sourceMap: true,
        sourceMapName: function (path) {
          return path + '.' + Date.now() + '.map';
        }
      },
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/templates.js': [
            '.tmp/concat/scripts/templates.js'
          ],
          '<%= yeoman.dist %>/scripts/scripts.min.js': [
            '<%= yeoman.dist %>/scripts/scripts.js'
          ]
        }
      }
    },
    concat: {
      options: {
        separator: grunt.util.linefeed,
      }
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
      },
      ci: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    //ngtemplates settings
    ngtemplates: {
      bulbsCmsApp: {
        cwd: '<%= yeoman.app %>',
        src: ['views/{,*/}*.html', 'components/**/*.html'],
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
    },

    protractor: {
      options: {
        configFile: 'node_modules/protractor/referenceConf.js', // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
          // Arguments passed to the command
        }
      },
      'bulbs-cms': {
        options: {
          configFile: 'protractor.conf.js', // Target-specific config file
          args: {} // Target-specific arguments
        }
      },
    },

    release: {
      options: {
        file: 'bower.json',
        npm: false,
        tagMessage: '<%= version %>',
        branch: 'release',
        github: {
          repo: 'theonion/bulbs-cms',
          usernameVar: 'GITHUB_USERNAME',
          passwordVar: 'GITHUB_TOKEN'
        }
      }
    }

  });

  var shell = require('shelljs');

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
      'less',
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
    'ngtemplates',
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

  grunt.registerTask('commitBuild', function () {
    var stdout = shell.exec('git add dist/scripts/scripts.min.js.*.map dist/scripts/templates.js.*.map;' +
                            'git commit -am \'new build\'',
      {silent: true});
    grunt.log.ok(stdout.output);
  });

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);

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
