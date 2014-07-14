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
        tasks: ['requirejs', 'less'],
      }
    },
    less: {
      production: {
        options: {
          paths: ["src/less"],
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
    }
  });
  // Load external tasks
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['requirejs', 'less', 'uglify']);
};