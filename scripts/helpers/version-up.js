/**
 * Opens a JSON file provided as the first argument to this script, searches for
 *  "version" key in the root object, versions up that key based on the
 *  second argument to this script ('major', 'minor', 'patch'), then writes the
 *  JSON back to the file with the new version.
 */

'use strict';

var fs = require('fs');

var ConsoleHelper = require('./console-helper');
var Versioner = require('./versioner');

var jsonFile = process.argv[2];     // path to a JSON file
var versionType = process.argv[3];  // 'major', 'minor', 'patch'


Versioner.getVersion(jsonFile, function (version, json) {
  var newVersionSplit = [version.major, version.minor, version.patch];
  if (versionType === 'major') {
    newVersionSplit[0]++;
    newVersionSplit[1] = 0;
    newVersionSplit[2] = 0;
  } else if (versionType === 'minor') {
    newVersionSplit[1]++;
    newVersionSplit[2] = 0;
  } else if (versionType === 'patch') {
    newVersionSplit[2]++;
  } else {
    ConsoleHelper.exitWithError('Invalid version type "%s" provided!', versionType);
  }

  json.version = newVersionSplit.join('.');
  fs.writeFile(jsonFile, JSON.stringify(json, null, 2), function (error) {
    if (error) {
      ConsoleHelper.exitWithError(error);
    }

    console.log('Versioned up "%s" to "%s"', jsonFile, json.version);
  });
});
