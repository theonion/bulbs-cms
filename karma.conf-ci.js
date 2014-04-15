// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {

  if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    console.log('SAUCE_USERNAME or SAUCE_ACCESS_KEY not set');
    process.exit(1);
  }

  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'app/image.js',
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/bootstrap/dist/js/bootstrap.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower_components/nprogress/nprogress.js',
      'app/bower_components/bootstrap-switch/build/js/bootstrap-switch.js',
      //'app/bower_components/raven-js/dist/raven.js',
      'app/bower_components/moment/moment.js',
      'app/bower_components/underscore/underscore.js',
      'app/bower_components/urlify/urlify.js',
      'app/bower_components/onion-editor/build/onion-editor.min.js',
      'app/bower_components/bootstrap3-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
      'app/scripts/*.js',
      'app/scripts/**/*.js',
      'app/mocks/app.js',
      'app/mocks/api.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js',
      'test/config.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // Sauce Labs Config
    customLaunchers: {
      'SL_Chrome': {
        base: 'SauceLabs',
        browserName: 'chrome'
      },
      'SL_Firefox': {
        base: 'SauceLabs',
        browserName: 'firefox',
        version: '26'
      },
      'SL_Safari': {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'OS X 10.9'
        version: '7'
      },
    },

    sauceLabs: {
      testName: 'Bulbs CMS Karma Tests',
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    },

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    reporters: ['dots', 'saucelabs'],
    browsers: Object.keys(customLaunchers),
    captureTimeout: 120000,
    singleRun: true
  });
};
