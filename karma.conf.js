// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  'use strict';

  // sauce labs custom launchers (https://saucelabs.com/platforms)
  var customLaunchers = {
    'SL_Chrome': {
      base: 'SauceLabs',
      browserName: 'chrome',
      version: '38'
    },
    'SL_Firefox': {
      base: 'SauceLabs',
      browserName: 'firefox'
    },
    // 'SL_Safari': {
    //   base: 'SauceLabs',
    //   browserName: 'safari',
    //   platform: 'OS X 10.9',
    //   version: '7'
    // }
  };

  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'app/cms-image.js',
      'app/bower_components/lodash/lodash.js',
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/jcrop/js/jquery.Jcrop.js',
      'app/bower_components/bootstrap/dist/js/bootstrap.js',
      'app/bower_components/firebase/firebase-debug.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-cookie/angular-cookie.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower_components/angular-uuid4/angular-uuid4.js',
      'app/bower_components/angularfire/dist/angularfire.js',
      'app/bower_components/nprogress/nprogress.js',
      'app/bower_components/restangular/dist/restangular.js',
      'app/bower_components/moment/moment.js',
      'app/bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020.js',
      'app/bower_components/urlify/urlify.js',
      'app/bower_components/onion-editor/build/onion-editor.min.js',
      'app/bower_components/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
      'app/bower_components/Keypress/keypress.js',
      'app/bower_components/zeroclipboard/dist/ZeroClipboard.min.js',
      'app/bower_components/ng-clip/dest/ng-clip.min.js',
      'app/bower_components/bulbs-autocomplete/dist/bulbs-autocomplete.js',
      'app/bower_components/angular-ui-sortable/sortable.js',

      'app/mocks/app.js',
      'app/mocks/api.js',
      'app/mocks/betty.js',
      'app/mocks/firebaseapi.js',

      'app/shared/**/*.js',
      'app/components/**/*.js',

      'app/scripts/*.js',

      'app/scripts/api/module.js',
      'app/scripts/api/*.js',

      'app/scripts/**/*.js',
      'test/spec/**/*.js',

      'app/scripts/api/*.js',

      'test/config.js',

      'app/views/**/*.html',
      'app/components/**/*.html'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    preprocessors: {
      'app/components/**/*.html': 'ng-html2js',
      'app/views/**/*.html': 'ng-html2js',
      'app/scripts/**/*.js': 'coverage'
    },

    // set up reporters
    reporters: ['progress', 'coverage'],

    ngHtml2JsPreprocessor: {
      // strip this from the file path
      stripPrefix: 'app',

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

  if (process.env.TRAVIS) {

    // we're using Travis CI to do karma, configure as such
    var buildLabel = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')';

    // set up saucelabs stuff
    config.captureTimeout = 0; // rely on SL timeout
    config.singleRun = true;
    config.autoWatch = false;
    config.sauceLabs = {
      build: buildLabel,
      startConnect: false,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    };

    config.customLaunchers = customLaunchers;
    config.browsers = Object.keys(customLaunchers);
    config.singleRun = true;
    config.reporters.push('saucelabs');

  } else {
    // this is local, just use Chrome
    config.singleRun = false;
    config.autoWatch = true;
    config.browsers = ['Chrome'];
  }

};
