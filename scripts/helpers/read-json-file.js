/**
 * Utility for opening and reading a JSON file.
 */

'use strict';

var fs = require('fs');
var ConsoleHelper = require('./console-helper');


module.exports = {
  /**
   * Read the contents of a JSON file.
   *
   * @param {string} jsonFile - JSON file to read data from.
   * @param {function} callback - callback to JSON reading that takes as its
   *  arguments (parsed file JSON).
   */
  getJSON: function (jsonFile, callback) {
    fs.readFile(jsonFile, function(error, data) {
      if (error) {
        ConsoleHelper.exitWithError(error);
      }

      callback(JSON.parse(data));
    });
  }
};
