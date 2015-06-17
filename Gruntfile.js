'use strict';

var LIVERELOAD_PORT = 35729;
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // time how long grunt tasks take
  require('time-grunt')(grunt);

  var modRewrite = require('connect-modrewrite');
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

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Watches files for changes and runs tasks based on the changed files
    watch: {
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
            '<%= config.app %>'
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
            '<%= config.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= config.dist %>'
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
        '<%= config.app %>/components/**/*.js',
        '<%= config.app %>/shared/**/*.js',
        '<%= config.app %>/scripts/{,*/}*.js'
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
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
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
        src: ['<%= config.app %>/index.html'],
        ignorePath: '<%= config.app %>/',
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
      production: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>',
          src: [
            'styles/**/*.less',
            '!**/_*.less'
          ],
          dest: '.tmp/',
          ext: '.css'
        }]
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= config.dist %>/components/**/*.{js,css}',
            '<%= config.dist %>/shared/**/*.{js,css}',
            '<%= config.dist %>/scripts/{,*/}*.js',
            '<%= config.dist %>/styles/{,*/}*.css',
            '<%= config.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= config.dist %>/styles/fonts/*',
            '!**/*.tests.js',
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= config.app %>/index.html',
      options: {
        dest: '<%= config.dist %>',
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
      html: ['<%= config.dist %>/{,*/}*.html'],
      css: [
        '<%= config.dist %>{,*/}*.css'
      ],
      options: {
        assetsDirs: ['<%= config.dist %>']
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= config.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= config.dist %>/images'
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
          cwd: '<%= config.dist %>',
          src: ['*.html', 'views/{,*/}*.html'],
          dest: '<%= config.dist %>'
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
          cwd: '<%= config.dist %>/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= config.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
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
          dest: '<%= config.dist %>/images',
          src: ['generated/*']
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= config.app %>',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      },
      jcropGif: {
        expand: true,
        cwd: '<%= config.app %>/bower_components/jcrop/css',
        dest: '<%= config.dist %>/styles/',
        src: 'Jcrop.gif'
      },
      bootstrapFonts: {
        expand: true,
        cwd: '<%= config.app %>/bower_components/bootstrap/dist/fonts',
        dest: '<%= config.dist %>/fonts/',
        src: ['glyphicons-halflings-regular.*', 'glyphicons-halflings-regular.woff2']
      },
      fontawesome: {
        expand: true,
        cwd: '<%= config.app %>/bower_components/font-awesome/fonts',
        dest: '<%= config.dist %>/fonts/',
        src: ['fontawesome-webfont.*']
      },
      fontawesomeCSS: {  // This is a hack for now. FontAwesome REALLY doesn't like getting minified, I guess.
        expand: true,
        cwd: '<%= config.app %>/bower_components/font-awesome/css',
        dest: '<%= config.dist %>/styles/',
        src: ['font-awesome.min.css']
      },
      zeroclipboard: {
        expand: true,
        cwd: '<%= config.app %>/bower_components/zeroclipboard/dist',
        dest: '<%= config.dist %>/swf/',
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
      },
      less_components: {
        files: {
          'app/styles/_components.less': [
            'app/components/**/*.less'
          ],
          'app/styles/_shared.less': [
            'app/shared/**/*.less'
          ]
        },
        options: {
          endtag: '// endinjector:less_components',
          sort: function (a, b) {
            return a < b;
          },
          starttag: '// injector:less_components',
          transform: function (filepath) {
            filepath = filepath.replace(/app\//, '../');
            return '@import "' + filepath + '";';
          }
        }
      },
      local_dependencies: {
        files: {
          'app/index.html': [
            '.tmp/styles/*.css',
            'app/components/**/*.js',
            'app/shared/**/*.js',
            'app/scripts/directives/*.js',
            'app/scripts/directives/autocomplete/*.js',
            'app/scripts/controllers/*.js',
            'app/scripts/services/*.js',
            'app/scripts/filters/*.js',
            '!**/*.tests.js'
          ],
        },
        options: {
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
          '<%= config.dist %>/scripts/templates.js': [
            '.tmp/concat/scripts/templates.js'
          ],
          '<%= config.dist %>/scripts/scripts.min.js': [
            '<%= config.dist %>/scripts/scripts.js'
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
        cwd: '<%= config.app %>',
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
