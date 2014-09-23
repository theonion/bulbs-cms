'use strict';

/**
 * Methods to create and retrieve versions in local storage. Articles are stored as json strings under the keys
 *  'article.{timestamp}.{article id}'. When local storage is full, it will attempt to remove values older than
 *  yesterday.
 */
angular.module('bulbsCmsApp')
  .factory('LocalStorageBackup', function ($routeParams, $window, moment, _) {

    var keyPrefixArticle = 'article';
    var keyPrefix = keyPrefixArticle + '.' + $routeParams.id + '.';

    return {

      /**
       * Save content to local storage.
       *
       * @param articleData   Content to save to local storage.
       * @return New version data or null if no version was created.
       */
      create: function (articleData) {

        var version = null;

        // check if we have local storage
        if ($window.localStorage) {

          // create new version object
          version = {
            timestamp: moment().valueOf(),
            content: articleData
          };

          try {

            // create new local storage item with version content
            $window.localStorage.setItem(keyPrefix + moment().valueOf(), JSON.stringify(version));

          } catch (error) {

            // some error occurred, prune entries older than yesterday
            console.log('Caught localStorage error: ' +  error);
            console.log('Pruning old entries...');

            // loop through local storage keys and see if they're old
            _.chain($window.localStorage)
              // pick keys that are articles and that are older than yesterday
              .pick(function (value, key) {
                var keySplit = key.split('.'),
                    pickForRemoval = false;
                // check that this is an article in storage
                if (keySplit.length === 3 && keySplit[0] === keyPrefixArticle) {
                  var yesterday = moment().subtract({days: 1}).valueOf(),
                      keyTime = Number(keySplit[2]);
                  // if older than yesterday, pick the key for removal
                  pickForRemoval = keyTime < yesterday;
                }
                // return our result
                return pickForRemoval;
              })
              // these keys should be removed from local storage
              .each(function (value, key) {
                $window.localStorage.removeItem(key);
              });

            // now try to add entry again
            try {
              $window.localStorage.setItem(version.timestamp, JSON.stringify(version.content));
            } catch (error) {
              console.log('Maybe you\'ve been saving too much? Failed again at adding entry, no more retries: ' + error);
            }

          }
        }
      },
      /**
       * Get all versions for this article in local storage. No guarantee of order.
       *
       * @return  objects returned contain a timestamp and a content variable which holds the version's content.
       */
      versions: function () {

        return _
          // loop through entries of local storage
          .chain($window.localStorage)
            // pick only entries that are for this particular article
            .pick(function (stored, key) {
              var keySplit = key.split('.');
              return keySplit.length === 3 && keySplit[0] === keyPrefixArticle && keySplit[1] === $routeParams.id;
            })
            // parse and map these entries into an array
            .map(function (stored) {
              return JSON.parse(stored);
            })
          // return the array of version objects
          .value();

      }

    };

  });
