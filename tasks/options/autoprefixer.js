/**
 * Add vendor prefixed styles.
 */
'ust strict';

var config = require('../config');

module.exports = {
  options: {
    browsers: ['last 1 version']
  },
  dist: {
    files: [{
      expand: true,
      cwd: config.paths.tmp('styles/'),
      src: '{,*/}*.css',
      dest: config.paths.tmp('styles/')
    }]
  }
};
