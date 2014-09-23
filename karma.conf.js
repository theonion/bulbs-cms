// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

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
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/jcrop/js/jquery.Jcrop.js',
      'app/bower_components/bootstrap/dist/js/bootstrap.js',
      'app/bower_components/firebase/firebase-debug.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower_components/angularfire/dist/angularfire.js',
      'app/bower_components/nprogress/nprogress.js',
      'app/bower_components/restangular/dist/restangular.js',
      'app/bower_components/restangular/dist/restangular.js',
      'app/bower_components/moment/moment.js',
      'app/bower_components/underscore/underscore.js',
      'app/bower_components/urlify/urlify.js',
      'app/bower_components/onion-editor/build/onion-editor.min.js',
      'app/bower_components/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
      'app/bower_components/Keypress/keypress.js',
      
      'app/mocks/app.js',
      'app/mocks/api.js',
      'app/mocks/betty.js',
      'app/mocks/firebaseapi.js',

      'app/scripts/*.js',
      'app/scripts/**/*.js',
      'test/spec/**/*.js',
      'test/config.js',
      'app/views/**/*.html'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)

    preprocessors: {
      'app/views/**/*.html': 'ng-html2js',
      'app/scripts/**/*.js': 'coverage'
    },

    reporters: ['progress', 'coverage'],

    ngHtml2JsPreprocessor: {
      // strip this from the file path
      stripPrefix: 'app',

      // setting this option will create only a single module that contains templates
      // from all the files, so you can load them all with module('foo')
      moduleName: 'jsTemplates'
    },

    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/'
    },

  });

  if (process.env.TRAVIS) {
    var buildLabel = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')';

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
    config.singleRun = false;
    config.autoWatch = true;
    config.browsers = ['Chrome'];
  }

};
