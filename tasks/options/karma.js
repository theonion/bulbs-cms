/**
 * Karma testing configuration.
 */
'use strict';

module.exports = {
  unit: {
    configFile: 'karma.conf.js',
  },
  ci: {
    configFile: 'karma.conf.js',
    singleRun: true
  }
};
