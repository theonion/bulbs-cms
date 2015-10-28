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
        config.paths.tmp(),
        config.paths.dist('*'),
        '!' + config.paths.dist('.git*')
      ]
    }]
  },
  server: config.paths.tmp()
};
