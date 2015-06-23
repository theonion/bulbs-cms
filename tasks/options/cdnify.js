/**
 * Replace Google CDN references.
 */
'use strict';

var config = require('../config');

module.exports = {
  dist: {
    html: [config.paths.dist('*.html')]
  }
};
