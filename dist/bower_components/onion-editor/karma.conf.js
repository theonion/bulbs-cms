// Karma configuration
// Generated on Thu Jul 31 2014 11:09:41 GMT-0500 (CDT)

module.exports = function(config) {

  var customLaunchers = {
    'SL_Chrome': {
      base: 'SauceLabs',
      browserName: 'chrome'
    },
    'SL_Firefox': {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '27'
    },
    'SL_Safari': {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.9',
      version: '7'
    }
  };

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    plugins: [
      'karma-coverage',
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-safari-launcher',
      'karma-requirejs',
      'karma-sauce-launcher'
    ],

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
      'test-main.js',

      'node_modules/es6-promise/dist/promise-1.0.0.js',
      'bower_components/scribe/build/scribe.js',
      'bower_components/jquery/dist/jquery.js',
      'bower_components/jasmine-jquery/lib/jasmine-jquery.js',

      'src/js/onion-editor.js',

      {pattern: 'bower_components/scribe-plugin-*/*.js', included: false},

      {pattern: 'test/fixtures/*.html', included: false},
      {pattern: 'src/js/*/*.js', included: false},
      {pattern: 'test/**/*spec.js', included: false},
      {pattern: 'test/*/*spec.js', included: false}
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    customLaunchers: customLaunchers,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Safari'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });

  if (process.env.TRAVIS) {
    var buildLabel = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')';

    config.captureTimeout = 0; // rely on SL timeout

    config.sauceLabs = {
      build: buildLabel,
      startConnect: false,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    };

    config.browsers = Object.keys(customLaunchers);
    config.singleRun = true;
    config.reporters.push('saucelabs');
  } else {
    config.preprocessors = {
      'src/js/onion-editor.js': 'coverage',
      'src/js/*/*.js': 'coverage'
    };
    config.reporters.push('coverage');
  }
};
