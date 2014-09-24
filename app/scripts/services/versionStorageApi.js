'use strict';

/**
 * Api for saving article versions. Will automatically detect and attempt to use firebase, otherwise local storage
 *  will be used for versions.
 *
 * This API expects all version objects to be in at least the following form:
 *
 *  {
 *    timestamp: Number   - timestamp in ms for this version
 *    content: Object     - content this version holds, which in this case is an article object
 *  }
 */
angular.module('bulbsCmsApp')
  .factory('VersionStorageApi', function ($q, FirebaseApi, FirebaseArticleFactory, LocalStorageBackup) {

    // set up a promise for checking if we can authorize with firebase
    var firebaseAvailableDefer = $q.defer(),
        $firebaseAvailable = firebaseAvailableDefer.promise;
    FirebaseApi.$authorize()
      .then(function () {

        // we have a firebase connection, use firebase for versioning
        firebaseAvailableDefer.resolve(FirebaseArticleFactory.$retrieveCurrentArticle());

      })
      .catch(function () {

        // we don't have a firebase connection, use local storage for versioning
        firebaseAvailableDefer.reject();

      });

    /**
     * Keep only the data we want to persist for an article
     *
     * @param articleData   article data to persist.
     */
    var scrubArticle = function (articleData) {

      return _.chain(articleData)
        // knock out any object values that are functions
        .omit(function (value) {
          return _.isFunction(value);
        })
        // make undefineds null
        .each(function (value, key, obj) {
          if (_.isUndefined(value)) {
            obj[key] = null;
          }
        }).value();

    };

    return {

      /**
       * Create a new version either in firebase or in local storage.
       *
       * @param rawArticleData  raw article data to copy and transform before saving.
       * @param articleIsDirty  true if the article has unsaved changes, false otherwise.
       * @return  a promise that resolves on creation with a version object that contains timestamp and content
       *  properties.
       */
      $create: function (rawArticleData, articleIsDirty) {

        // get article data that we want to save
        var articleData = scrubArticle(rawArticleData);

        // create deferred to return
        var createDefer = $q.defer(),
            createPromise = createDefer.promise;

        // article is dirty and should be saved, check if firebase is being used
        $firebaseAvailable
          .then(function ($currentArticle) {

            // if article is dirty or there are no versions, attempt to create one using firebase
            if (articleIsDirty || $currentArticle.$versions().length < 1) {

              // we do have firebase, so use firebase
              $currentArticle.$createVersion(articleData)
                .then(function (versionData) {
                  // create occurred, resolve it with new version data
                  createDefer.resolve(versionData);
                })
                .catch(function () {
                  // create didn't occur, reject promise
                  createDefer.reject();
                });

            } else {

              // article is not dirty, reject create
              createDefer.reject();

            }

          })
          .catch(function () {

            // if article is dirty or there are no versions, attempt to create one using local storage
            if (articleIsDirty || LocalStorageBackup.versions().length < 1) {

              // create version with local storage
              var versionData = LocalStorageBackup.create(articleData);
              if (versionData !== null) {
                // version was created, resolve create defer with version data
                createDefer.resolve(versionData);
              } else {
                // version wasn't created, reject promise
                createDefer.reject();
              }

            } else {

              // article is not dirty, reject create
              createDefer.reject();

            }

          });

        // return create promise
        return createPromise;

      },
      /**
       * Retrieve all versions either from firebase or local storage.
       * @return  list of version objects sorted by timestamp descending.
       */
      $all: function () {

        // set up deferred objects for all retrieval
        var allDefer = $q.defer(),
            allPromise = allDefer.promise;

        // check if we have firebase
        $firebaseAvailable
          .then(function ($currentArticle) {

            // we do have firebase, so use firebase
            $currentArticle.$versions().$loaded(function (versions) {

              allDefer.resolve(versions);

            });

          })
          .catch(function () {

            // we don't have firebase so use local storage
            allDefer.resolve(LocalStorageBackup.versions());

          });

        // ensure versions are ordered by timestamp desc when they return
        return allPromise.then(function (versions) {
            return _.sortBy(versions, function (version) {
              return -version.timestamp;
            });
          });

      }

    };

  });