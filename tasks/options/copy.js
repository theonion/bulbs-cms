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
      cwd: config.paths.app,
      dest: config.paths.dist,
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
      dest: config.paths.dist + '/images',
      src: ['generated/*']
    }]
  },
  styles: {
    expand: true,
    cwd: config.paths.app,
    dest: '.tmp/styles/',
    src: '{,*/}*.css'
  },
  jcropGif: {
    expand: true,
    cwd: config.paths.app + '/bower_components/jcrop/css',
    dest: config.paths.dist + '/styles/',
    src: 'Jcrop.gif'
  },
  bootstrapFonts: {
    expand: true,
    cwd: config.paths.app + '/bower_components/bootstrap/dist/fonts',
    dest: config.paths.dist + '/fonts/',
    src: ['glyphicons-halflings-regular.*', 'glyphicons-halflings-regular.woff2']
  },
  fontawesome: {
    expand: true,
    cwd: config.app + '/bower_components/font-awesome/fonts',
    dest: config.dist + '/fonts/',
    src: ['fontawesome-webfont.*']
  },
  fontawesomeCSS: {  // This is a hack for now. FontAwesome REALLY doesn't like getting minified, I guess.
    expand: true,
    cwd: config.app + '/bower_components/font-awesome/css',
    dest: config.dist + '/styles/',
    src: ['font-awesome.min.css']
  },
  zeroclipboard: {
    expand: true,
    cwd: config.app + '/bower_components/zeroclipboard/dist',
    dest: config.dist + '/swf/',
    src: ['ZeroClipboard.swf']
  }
};
