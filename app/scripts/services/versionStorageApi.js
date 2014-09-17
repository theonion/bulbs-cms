'use strict';

/**
 * Api for saving article versions. Will automatically detect and attempt to use firebase, otherwise local storage
 *  will be used for versions.
 *
 * This API expects all version objects to be in the following form:
 *
 *  {
 *    timestamp: Number   - timestamp in ms for this version
 *    content: String     - content this version holds
 *  }
 */
angular.module('bulbsCmsApp')
  .factory('VersionStorageApi', function ($q, FirebaseApi, FirebaseArticleFactory, Localstoragebackup) {

    var firebaseAvailableDefer = $q.defer(),
        $firebaseAvailable = firebaseAvailableDefer.promise;
    FirebaseApi.$authorize
      .then(function () {

        // we have a firebase connection, use firebase for versioning
        firebaseAvailableDefer.resolve(FirebaseArticleFactory.$retrieveCurrentArticle());

      })
      .catch(function () {

        // we don't have a firebase connection, use local storage for versioning
        firebaseAvailableDefer.reject();

      });


    return {

      create: function (content) {

        var createDefer = $q.defer(),
            createPromise = createDefer.promise;
        $firebaseAvailable
          .then(function ($currentArticle) {

            // we do have firebase, so use firebase
            $currentArticle.$createVersion(content)
              .then(function (versionData) {
                // create occurred, resolve it with new version data
                createDefer.resolve(versionData);
              })
              .catch(function () {
                // create didn't occur, reject promise
                createDefer.reject();
              });

          })
          .catch(function () {

            // we don't have firebase, so use local storage
            var version = Localstoragebackup.backupToLocalStorage(content);

            if (version !== null) {
              // version was created, resolve create defer with version data
              createDefer.resolve(version);
            } else {
              // version wasn't created, reject promise
              createDefer.reject();
            }

          });

        // return create promise
        return createPromise;

      },
      all: function () {

        var allDefer = $q.defer(),
            allPromise = allDefer.promise;
        $firebaseAvailable
          .then(function ($currentArticle) {

            // we do have firebase, so use firebase
            $currentArticle.$versions.$loaded(function (versions) {

              allDefer.resolve(versions);

            });

          })
          .catch(function () {

            // we don't have firebase so use local storage
            allDefer.resolve(Localstoragebackup.getVersions());

          });

        return allPromise;

      }

    };

  });