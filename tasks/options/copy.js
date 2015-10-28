/**
 * Copy files into locations for other tasks.
 */
'use strict';

var config = require('../config');

module.exports = {
  dist: {
    files: [{
      expand: true,
      dot: true,
      cwd: config.paths.app(),
      dest: config.paths.dist(),
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
      dest: config.paths.dist('images'),
      src: ['generated/*']
    }]
  },
  static_tmp: {
    expand: true,
    cwd: config.paths.app('mocks'),
    dest: config.paths.tmp('static'),
    src: 'inline-objects.json'
  },
  styles: {
    expand: true,
    cwd: config.paths.app(),
    dest: config.paths.tmp('styles/'),
    src: '{,*/}*.css'
  },
  jcropGif: {
    expand: true,
    cwd: config.paths.app('bower_components/jcrop/css'),
    dest: config.paths.dist('styles/'),
    src: 'Jcrop.gif'
  },
  bootstrapFonts: {
    expand: true,
    cwd: config.paths.app('bower_components/bootstrap/dist/fonts'),
    dest: config.paths.dist('fonts/'),
    src: ['glyphicons-halflings-regular.*', 'glyphicons-halflings-regular.woff2']
  },
  font_awesome_fonts_tmp: {
    expand: true,
    cwd: config.paths.app('bower_components/font-awesome/fonts'),
    dest: config.paths.tmp('static/'),
    src: ['fontawesome-webfont.*']
  },
  font_awesome_fonts_dist: {
    expand: true,
    cwd: config.paths.app('bower_components/font-awesome/fonts'),
    dest: config.paths.dist('fonts/'),
    src: ['fontawesome-webfont.*']
  },
  // font awesome with our custom overrides
  font_awesome_less_tmp_styles: {
    expand: true,
    flatten: true,
    cwd: config.paths.app(),
    dest: config.paths.tmp('font-awesome-less/'),
    src: [
      'styles/font-awesome/variables.less',
      'bower_components/font-awesome/less/*.less',
      '!bower_components/font-awesome/less/variables.less'
    ]
  },
  zeroclipboard: {
    expand: true,
    cwd: config.paths.app('bower_components/zeroclipboard/dist'),
    dest: config.paths.dist('swf/'),
    src: ['ZeroClipboard.swf']
  }
};
