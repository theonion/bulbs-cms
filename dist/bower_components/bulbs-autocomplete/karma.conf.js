// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  'use strict';

  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/lodash/lodash.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'src/**/*.html',
      'src/**/*.js',
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    preprocessors: {
      'src/**/*.html': 'ng-html2js',
    },

    // set up reporters
    reporters: ['progress'],

    ngHtml2JsPreprocessor: {

      // setting this option will create only a single module that contains templates
      // from all the files, so you can load them all with module('foo')
      moduleName: 'jsTemplates'
    },

    // set up lcov coverage reporter
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/'
    },

  });

  // this is local, just use Chrome
  config.singleRun = false;
  config.autoWatch = true;
  config.browsers = ['Chrome'];
};
