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
            var keysToRemove = [];
            _.each(_.keys($window.localStorage), function (key) {

              // check if this key is older than yesterday, if so add it to list of keys to remove
              var keySplit = key.split('.');
              if (keySplit.length === 3 && keySplit[0] === keyPrefixArticle) {
                var yesterday = moment().subtract({days: 1}).valueOf(),
                    keyTime = Number(keySplit[2]);
                if (keyTime < yesterday) {
                  // don't keep this one, too old
                  keysToRemove.push(key);
                }
              }

            });

            // remove each identified key from local storage
            _.each(keysToRemove, function (key) {
              $window.localStorage.removeItem(key);
            });

            // now try to add entry again
            try {
              $window.localStorage.setItem(version.timestamp, JSON.stringify(version.content));
            } catch (error) {
              console.log('Failed again at adding entry, no more retries: ' + error);
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

        var versions = [];
        _.each(_.keys($window.localStorage), function (key) {

          // check if this entry should be added to the versions list
          var keySplit = key.split('.'),
              isVersionKey = (keySplit.length === 3 && keySplit[0] === keyPrefixArticle
                                && keySplit[1] === $routeParams.id);
          if (isVersionKey) {
            versions.push(JSON.parse($window.localStorage[key]));
          }

        });

        return versions;

      }

    };

  });
