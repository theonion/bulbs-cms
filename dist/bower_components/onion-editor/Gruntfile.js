module.exports = function(grunt) {
  var banner = '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n';
  // Configure Grunt
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    requirejs: {
      compile: {
        options: {
          mainConfigFile: 'build.js'
        }
      }
    },
    watch: {
      scripts: {
        files: ['src/js/*.js', 'src/js/*/*.js', 'src/less/*.less','src/less/*/*.less'],
        tasks: ['requirejs', 'less', 'uglify'],
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          'public/*',
          'build/*'        ]
      }
    },
    less: {
      production: {
        options: {
          paths: ['src/less'],
          cleancss: false
        },
        files: {
          'build/editor-main.css': ['src/less/editor/*'],
          'build/inline.css': ['src/less/inline.less']
        }
      }
    },
    uglify: {
      options: {
        banner: banner
      },
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    connect: {
      options: {
        base: [
          'public',
          'build'
        ],
        port: 51175,
        hostname: '0.0.0.0',
        livereload: true,
        keepalive: true
      },
      livereload: {
        options: {
          open: true
        }
      }
    }
  });
  // Load external tasks
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');
  grunt.registerTask('default', ['requirejs', 'less', 'uglify']);


  grunt.registerTask('serve', ['requirejs', 'less', 'uglify', 'connect:livereload']);

  
};