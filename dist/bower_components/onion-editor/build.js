require.config({
  baseUrl: "./src/js/",
  paths: {
    'scribe': '../../bower_components/scribe/scribe',
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
    'link-formatter': './formatters/link-formatter'
  },
  name: "../../bower_components/almond/almond",
  wrap: {
    startFile: 'src/js/wrap-start.frag',
    endFile: 'src/js/wrap-end.frag'
  },
  include: ["onion-editor"],
  optimize: "none",
  out: "./build/onion-editor.js"
});
