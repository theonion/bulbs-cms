/**
 * Configurations for static web server.
 */
'use strict';

var config = require('../config');
var modRewrite = require('connect-modrewrite');
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = {
  options: {
    port: config.const.CONNECT_PORT,
    hostname: config.const.CONNECT_URL,
    livereload: config.const.LIVERELOAD_PORT
  },
  livereload: {
    options: {
      open: true,
      base: [
        '.tmp',
        config.paths.app
      ],
      middleware: function (connect) {
        return [
          modRewrite([
            '!\\.eot|\\.woff|\\.woff2\\.ttf|\\.svg|\\.html|\\.js|\\.css|\\.swf|\\.jp(e?)g|\\.png|\\.gif$ /index.html'
          ]),
          mountFolder(connect, '.tmp'),
          mountFolder(connect, config.paths.app)
        ];
      }
    }
  },
  test: {
    options: {
      port: 9001,
      base: [
        '.tmp',
        'test',
        config.paths.app
      ]
    }
  },
  dist: {
    options: {
      base: config.paths.dist
    }
  }
};
