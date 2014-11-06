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
  .factory('VersionStorageApi', function ($q, FirebaseApi, FirebaseArticleFactory, LocalStorageBackup, _) {

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
     * Memoized omitting function for deep scrubbing.
     */
    var _omitter = _.memoize(
      function (value, key) {
        return _.isFunction(value) ||
                  _.find(key, function (c) {
                    return c === '.' || c === '#' || c === '$' || c === '/' || c === '[' || c === ']';
                  });
      },
      function (value, key) {
        return [key, value];
      });

    /**
     * Recursively scrub object of functions and turn undefines into null, makes object valid for saving in firebase.
     *
     * @param obj   object to recurse through
     */
    var _deepScrub = function (obj) {

      var clone, transValue;

      if (_.isUndefined(obj)) {
        // turn undefineds into nulls, this allows deletion of property values
        clone = null;
      } else if (_.isPlainObject(obj)) {
        // this is an object, use omit to recurse through its members
        clone = {};
        _.forOwn(obj, function (value, key) {
          // run value through recursive omit call
          transValue = _deepScrub(value);
          // check if this should be omitted, if not clone it over
          if (!_omitter(transValue, key)) {
            clone[key] = transValue;
          }
        });
      } else if (_.isArray(obj)) {
        // this is an array, loop through items use omit to decide what to do with them
        clone = [];
        _.each(obj, function (value, key) {
          // run value through recursive omit call
          transValue = _deepScrub(value);
          // check if this should be omitted, if not clone over
          if (!_omitter(transValue, key)) {
            clone.push(transValue);
          }
        });
      } else {
        // not a special case, just return object
        clone = obj;
      }

      return clone;

    };

    /**
     * Keep only the data we want to persist for an article. Does a deep clone to scrub sub-objects.
     *
     * @param articleData   data to scrub.
     */
    var scrubArticle = function (articleData) {

      return _deepScrub(articleData);

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

            LocalStorageBackup.$versions().then(function (versions) {

              // if article is dirty or there are no versions, attempt to create one using local storage
              if (articleIsDirty || versions.length < 1) {

                // create version with local storage
                LocalStorageBackup.$create(articleData)
                  .then(function (versionData) {
                    // version was created, resolve create defer with version data
                    createDefer.resolve(versionData);
                  })
                  .catch(function (error) {
                    // version was not created, pass on error
                    createDefer.reject(error);
                  });

              } else {

                // article is not dirty, reject create
                createDefer.reject();

              }

            });

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
            LocalStorageBackup.$versions().then(function (versions) {
              allDefer.resolve(versions);
            }).catch(function (error) {
              allDefer.reject(error);
            });

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
