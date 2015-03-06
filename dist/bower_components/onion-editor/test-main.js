var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

var pathToModule = function(path) {
  var newPath =  path.replace(/^\/base\//, '../../').replace(/\.js$/, '');
  return newPath;
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base/src/js/',

  paths: {
    'bower': '../../bower_components/',
    'scribe': '../../bower_components/scribe/build/scribe',
    'jquery': '../../bower_components/jquery/dist/jquery',
    'scribe-plugin-blockquote-command': '../../bower_components/scribe-plugin-blockquote-command/scribe-plugin-blockquote-command',
    'scribe-plugin-curly-quotes': '../../bower_components/scribe-plugin-curly-quotes/scribe-plugin-curly-quotes',
    'scribe-plugin-formatter-plain-text-convert-new-lines-to-html': '../../bower_components/scribe-plugin-formatter-plain-text-convert-new-lines-to-html/scribe-plugin-formatter-plain-text-convert-new-lines-to-html',
    'scribe-plugin-heading-command': '../../bower_components/scribe-plugin-heading-command/scribe-plugin-heading-command',
    'scribe-plugin-intelligent-unlink-command': '../../bower_components/scribe-plugin-intelligent-unlink-command/scribe-plugin-intelligent-unlink-command',
    'scribe-plugin-keyboard-shortcuts': '../../bower_components/scribe-plugin-keyboard-shortcuts/scribe-plugin-keyboard-shortcuts',
    'scribe-plugin-sanitizer': './plugins/scribe-plugin-sanitizer',
    'scribe-plugin-smart-lists': '../../bower_components/scribe-plugin-smart-lists/scribe-plugin-smart-lists',
    'scribe-plugin-toolbar': '../../bower_components/scribe-plugin-toolbar/scribe-plugin-toolbar',
    'scribe-plugin-link-ui': './plugins/scribe-plugin-link-ui',
    'scribe-plugin-inline-objects': './plugins/scribe-plugin-inline-objects',
    'scribe-plugin-betty-cropper': './plugins/scribe-plugin-betty-cropper',
    'scribe-plugin-onion-video': './plugins/scribe-plugin-onion-video',
    'scribe-plugin-hr': './plugins/scribe-plugin-hr',
    'scribe-plugin-youtube': './plugins/scribe-plugin-youtube',
    'scribe-plugin-embed': './plugins/scribe-plugin-embed',
    'scribe-plugin-placeholder': './plugins/scribe-plugin-placeholder',
    'scribe-plugin-anchor': './plugins/scribe-plugin-anchor',
    'our-ensure-selectable-containers': './formatters/our-ensure-selectable-containers',
    'enforce-p-elements': './formatters/enforce-p-elements',
    'link-formatter': './formatters/link-formatter',
    'only-trailing-brs': './formatters/only-trailing-brs',
    'paste-strip-newlines': './formatters/paste-strip-newlines',
    'paste-strip-nbsps': './formatters/paste-strip-nbsps',
    'paste-from-word': './formatters/paste-from-word',
    'paste-sanitize': './formatters/paste-sanitize',
    'remove-a-styles': './formatters/remove-a-styles',
    'strip-bold-in-headings': './formatters/strip-bold-in-headings',
    'jasmine-jquery': '../../bower_components/jasmine-jquery/lib/jasmine-jquery'
  },

  shim: {
    'jquery': {
      exports: '$'
    }
  },

  wrap: {
    startFile: 'src/js/wrap-start.frag',
    endFile: 'src/js/wrap-end.frag'
  },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});
