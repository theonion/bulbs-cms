/**
 * Compiles LESS files.
 */
'ust strict';

var config = require('../config');

module.exports = {
  production: {
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
