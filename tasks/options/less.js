/**
 * Compiles LESS files.
 */
'ust strict';

var config = require('../config');

module.exports = {
  production: {
    options: {
      paths: [
        'app/styles',
        'app/bower_components'
      ],
    },
    files: [{
      expand: true,
      cwd: config.paths.app,
      src: [
        'styles/**/*.less',
        '!**/_*.less'
      ],
      dest: '.tmp/',
      ext: '.css'
    }]
  }
};
