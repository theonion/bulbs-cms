/**
 * Custom configuration variables to use in tasks and other grunt files.
 */
'use strict';

var grunt = require('grunt');

var Config = {
  environment: function () {
    return grunt.option('target') || process.env.APP_ENV || 'local';
  },
  paths: {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist'
  }
};

module.exports = Config;
