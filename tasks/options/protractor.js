/**
 * Protractor testing configuration.
 */
'use strict';

module.exports = {
  options: {
    configFile: 'node_modules/protractor/referenceConf.js', // Default config file
    keepAlive: true, // If false, the grunt process stops when the test fails.
    noColor: false, // If true, protractor will not use colors in its output.
    args: {
      // Arguments passed to the command
    }
  },
  'bulbs-cms': {
    options: {
      configFile: 'protractor.conf.js', // Target-specific config file
      args: {} // Target-specific arguments
    }
  },
};
