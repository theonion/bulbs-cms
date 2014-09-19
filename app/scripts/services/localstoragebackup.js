'use strict';

angular.module('bulbsCmsApp')
  .service('Localstoragebackup', function Localstoragebackup($routeParams, $window, moment, $, _) {

    /*
    hacky first version of local storage backup
    this is for backing up body contents to local storage
    for now this is just keying to articleBodyBackup.<timestamp>.<article id>.body
    if LS is full, it tries deleting old backups
    TODO: add tests
    TODO: make configurable
    TODO: apply to other fields
    TODO: capture routeChange and cancel the interval
      (this works for now because we're doing a full teardown on route change
      if we ever go back to a real 'single page app' this will fuck up)
    TODO: lots of stuff
    */

    this.keyPrefix = 'articleBodyBackup';
    this.keySuffix = '.' + $routeParams.id + '.body';

    var keyPrefix = this.keyPrefix;
    var keySuffix = this.keySuffix;

    /**
     * Save content to local storage.
     *
     * @param articleData   Content to save to local storage.
     * @return New version data or null if no version was created.
     */
    this.createVersion = function (articleData) {

      var version = null;

      // check if we have local storage
      if ($window.localStorage) {

        try {

          // create new version object
          version = {
            timestamp: keyPrefix + '.' + moment().valueOf() + keySuffix,
            content: articleData
          };

          // create new local storage item with verion content
          $window.localStorage.setItem(version.timestamp, JSON.stringify(version.content));

        } catch (error) {

          // some error occurred, prune entries older than yesterday
          console.log('Caught localStorage Error ' + error);
          console.log('Trying to prune old entries...');

          // remove all items older than yesterday from local storage
          _.chain($window.localStorage)
            // find all saved articles older than yesterday
            .every(function (stored, key) {
              var keep = false,
                  keySplit = key.split('.');
              if (keySplit.length === 4) {
                var yesterday = moment().subtract({days: 1}).unix(),
                    keyTime = Number(keySplit[1]);
                keep = keyTime < yesterday;
              }
              return keep;
            })
            // remove each item from local storage
            .each(function (stored, key) {
              $window.localStorage.removeItem(key);
            });

        }
      }

      return version;

    };

    /**
     * Get all versions for this article in local storage.
     *
     * @returns   An array of versions sorted by their timestamps. Objects returned contain a timestamp and a
     *  content variable which holds the version's content.
     */
    this.getVersions = function () {

      return _.chain($window.localStorage)
        // pick only those items in local storage whose keys start with backup prefix
        .pick(function (stored, key) {
          var keySplit = key.split('.');
          return keySplit.length === 4 && keySplit[0] === keyPrefix && keySplit[2] === $routeParams.id;
        })
        // map versions to an array, give each version its timestamp
        .map(function (stored, key) {
          var keySplit = key.split('.');
          return {
            timestamp: Number(keySplit[1]),
            content: JSON.parse(stored)
          };
        })
        // resolve this into an array
        .value();

    };

  });
