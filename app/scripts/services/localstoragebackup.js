'use strict';

/**
 * Methods to create and retrieve versions in local storage. Articles are stored as json strings under the keys
 *  'article.{timestamp}.{article id}'. When local storage is full, it will attempt to remove values older than
 *  yesterday.
 */
angular.module('bulbsCmsApp')
  .factory('LocalStorageBackup', function ($q, $routeParams, $window, moment, _, CurrentUser) {

    var keyPrefixArticle = 'article';
    var keyPrefix = keyPrefixArticle + '.' + $routeParams.id + '.';

    return {

      /**
       * Save content to local storage.
       *
       * @param articleData   Content to save to local storage.
       * @return New version data or null if no version was created.
       */
      $create: function (articleData) {

        var createDefer = $q.defer(),
            createPromise = createDefer.promise;

        // check if we have local storage
        if ($window.localStorage) {
          CurrentUser.$simplified().then(function (user) {

            // create new version object
            var version = {
              timestamp: moment().valueOf(),
              user: user,
              content: articleData
            };

            try {

              // create new local storage item with version content
              $window.localStorage.setItem(keyPrefix + moment().valueOf(), JSON.stringify(version));
              createDefer.resolve(version);

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
                createDefer.resolve(version);
              } catch (error) {
                // total failure, reject with an error.
                console.log('Maybe you\'ve been saving too much? Failed again at adding entry, no more retries: ' + error);
                createDefer.reject('Maybe you\'ve been saving too much? Failed again at adding entry, no more retries: ' + error);
              }
            }
          });

        } else {
          // no local storage, why are we here?
          createDefer.reject('You don\'t have local storage capabilities in your browser. Use a better browser.');
        }

        return createPromise;

      },
      /**
       * Get all versions for this article in local storage. No guarantee of order.
       *
       * @return  objects returned contain a timestamp and a content variable which holds the version's content.
       */
      $versions: function () {

        // note: using a promise here to better match the version api functionality
        var retrieveDefer = $q.defer(),
            retrievePromise = retrieveDefer.promise,
            versions =
              // loop through entries of local storage
              _.chain($window.localStorage)
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

        retrieveDefer.resolve(versions);

        return retrievePromise;

      }

    };

  });
