/**
 * Custom configuration variables to use in tasks and other grunt files.
 */
'use strict';

var grunt = require('grunt');

module.exports = {
  const: {
    CONNECT_PORT: 9069,
    CONNECT_URL: '0.0.0.0',
    LIVERELOAD_PORT: 35729
  },
  environment: function () {
    return grunt.option('target') || process.env.APP_ENV || 'local';
  },
  paths: {
    app: 'app',
    dist: 'dist'
  }
};
