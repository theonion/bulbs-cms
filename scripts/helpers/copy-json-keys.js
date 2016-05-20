/**
 * Utility for copying/overwriting json keys from one file to another.
 */

'use strict';

var fs = require('fs');

var ConsoleHelper = require('./console-helper');
var ReadJsonFile = require('./read-json-file');

var jsonFileFrom = process.argv[2]; // path to a JSON file to read info from
var jsonFileTo = process.argv[3];   // path to a JSON file to write info into
var inputKeys = process.argv[4];    // comma sep list of keys to copy

ReadJsonFile.getJSON(jsonFileFrom, function (jsonFrom) {
  var splitKeys = inputKeys.split(',');

  ReadJsonFile.getJSON(jsonFileTo, function (jsonTo) {

    splitKeys.forEach(function (key) {
      if (jsonFrom.hasOwnProperty(key)) {
        jsonTo[key] = jsonFrom[key];
      } else {
        ConsoleHelper.exitWithError('Unable to find key "%s" in origin file "%s"');
      }
    });

    fs.writeFile(jsonFileTo, JSON.stringify(jsonTo, null, 2), function (error) {
      if (error) {
        ConsoleHelper.exitWithError(error);
      }

      console.log(
        'Copied/overwrote keys [%s] from "%s" to "%s"',
        splitKeys.join(','),
        jsonFileFrom,
        jsonFileTo
      );
    });
  });
});
