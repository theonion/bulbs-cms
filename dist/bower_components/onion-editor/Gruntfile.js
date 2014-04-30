module.exports = function(grunt) {
  var banner = '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
        options: {
          separator: ';',
          banner: banner
        },
        dist: {
          src: [
                'src/base.js',
                'src/undoManager.js',
                'src/modules/toolbar.js',
                'src/modules/formatting.js',
                'src/modules/selection.js',
                'src/modules/inline.js',
                'src/modules/undo.js',
                //'src/modules/link.js',
                'src/modules/persist.js',
                'src/modules/editSource.js',
                'src/modules/textReplacement.js',
                'src/modules/screensize.js',
                'src/modules/theme.js',
                'src/modules/youtube.js',
                'src/modules/stats.js',


                'src/lib/rangy/rangy-core.js',
                'src/lib/rangy/rangy-cssclassapplier.js',
                'src/lib/rangy/rangy-selectionsaverestore.js',
                'src/lib/rangy/rangy-serializer.js',
                'src/lib/rangy/rangy-highlighter.js',
                'src/lib/rangy/rangy-textrange.js',
                'src/lib/sanitize.js',
                'src/lib/keymaster.js',
                //'src/lib/image.js',
                'src/findReplace.js',

                ],
          dest: 'build/<%= pkg.name %>.js'
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
    watch: {
      scripts: {
        files: ['src/*.js', 'src/*/*.js'],
        tasks: ['concat', 'uglify'],
      },
    },

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat', 'uglify']);

};
