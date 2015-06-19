/**
 * Deletes given files and folders.
 */
'use strict';

var config = require('../config');

module.exports = {
  dist: {
    files: [{
      dot: true,
      src: [
        '.tmp',
        config.paths.dist + '/*',
        '!' + config.paths.dist + '/.git*'
      ]
    }]
  },
  server: '.tmp'
};
